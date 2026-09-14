import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, BUCKET, signedGetUrl, deleteObject } from "./s3";

/**
 * Immagini caricate dal pannello e dall'agente WhatsApp.
 *
 * Due modi di conservarle, stesso URL pubblico (`/api/media/<chiave>`):
 * - MEDIA_DIR impostata -> i file stanno su disco, sul server del cliente;
 * - MEDIA_DIR vuota      -> restano sullo storage S3 (ambiente Runable).
 */
const MEDIA_DIR = (process.env.MEDIA_DIR ?? "").trim();
export const localMedia = MEDIA_DIR !== "";

const SAFE_KEY = /^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,200}$/;

/** URL pubblico stabile servito dal nostro server. */
export function mediaUrl(key: string) {
  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** true per le immagini caricate dal pannello, false per quelle del repo. */
export function isMediaUrl(url: string) {
  return url.startsWith("/api/media/");
}

export function keyFromMediaUrl(url: string) {
  return decodeURIComponent(url.replace(/^\/api\/media\//, ""));
}

export function validKey(key: string) {
  return SAFE_KEY.test(key) && !key.includes("..") && !key.startsWith("/");
}

function filePath(key: string) {
  const path = normalize(join(MEDIA_DIR, key));
  if (!path.startsWith(normalize(MEDIA_DIR))) throw new Error("chiave non valida");
  return path;
}

function sign(key: string, expires: number) {
  return createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "media")
    .update(`${key}|${expires}`)
    .digest("hex");
}

function signatureOk(key: string, expires: number, signature: string) {
  const expected = sign(key, expires);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

/** URL a cui il pannello invia il file (PUT). Locale: rotta firmata; S3: URL presigned. */
export async function uploadUrl(key: string, contentType: string) {
  if (!localMedia) {
    return getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: 600 },
    );
  }
  const expires = Date.now() + 10 * 60 * 1000;
  const path = key.split("/").map(encodeURIComponent).join("/");
  return `/api/media-upload/${path}?expires=${expires}&signature=${sign(key, expires)}`;
}

/** Salva il file caricato dal pannello (solo modalità locale). */
export async function saveUpload(input: {
  key: string;
  expires: number;
  signature: string;
  body: ArrayBuffer;
}) {
  if (!localMedia) return { ok: false, status: 404 as const };
  if (!validKey(input.key)) return { ok: false, status: 400 as const };
  if (!Number.isFinite(input.expires) || input.expires < Date.now()) {
    return { ok: false, status: 403 as const };
  }
  if (!signatureOk(input.key, input.expires, input.signature)) {
    return { ok: false, status: 403 as const };
  }
  const path = filePath(input.key);
  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, input.body);
  return { ok: true, status: 200 as const };
}

type Media =
  | { kind: "redirect"; redirect: string }
  | { kind: "file"; file: Bun.BunFile };

/** Immagine richiesta dal sito: file su disco oppure redirect firmato su S3. */
export async function readMedia(key: string): Promise<Media | null> {
  if (!validKey(key)) return null;
  if (!localMedia) {
    try {
      return { kind: "redirect", redirect: await signedGetUrl(key, 3600) };
    } catch {
      return null;
    }
  }
  const file = Bun.file(filePath(key));
  if (!(await file.exists())) return null;
  return { kind: "file", file };
}

/** Salva direttamente dei byte (foto ricevute su WhatsApp) e restituisce l'URL pubblico. */
export async function storeMedia(key: string, bytes: Uint8Array, contentType: string) {
  if (!validKey(key)) throw new Error("chiave non valida");
  if (!localMedia) {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    );
    return mediaUrl(key);
  }
  const path = filePath(key);
  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, bytes);
  return mediaUrl(key);
}

export async function deleteMedia(key: string) {
  if (!validKey(key)) return;
  if (!localMedia) {
    await deleteObject(key);
    return;
  }
  try {
    await unlink(filePath(key));
  } catch {
    // un file già assente non è un errore per l'utente
  }
}

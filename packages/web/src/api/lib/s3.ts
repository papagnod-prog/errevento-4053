import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET = process.env.S3_BUCKET!;

/** URL pubblico stabile servito dal nostro server (redirect firmato). */
export function mediaUrl(key: string) {
  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** true per le immagini caricate dal pannello (su storage), false per quelle locali. */
export function isMediaUrl(url: string) {
  return url.startsWith("/api/media/");
}

export function keyFromMediaUrl(url: string) {
  return decodeURIComponent(url.replace(/^\/api\/media\//, ""));
}

export function signedGetUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn,
  });
}

export async function deleteObject(key: string) {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch {
    // un file già assente non è un errore per l'utente
  }
}

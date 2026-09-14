import { z } from "zod";
import { authed } from "../middleware/auth";
import { mediaUrl, uploadUrl } from "../lib/media";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const DIACRITICS = /\p{Diacritic}/gu;

function safeName(name: string) {
  const clean = name
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean.slice(-80) || "immagine.jpg";
}

export const uploads = {
  /** URL firmato per caricare un'immagine direttamente sullo storage. */
  presign: authed
    .input(
      z.object({
        filename: z.string().min(1).max(200),
        contentType: z.string().min(1).max(100),
      }),
    )
    .handler(async ({ input }) => {
      const contentType = ALLOWED.includes(input.contentType)
        ? input.contentType
        : "image/jpeg";
      const key = `catalogo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(input.filename)}`;

      const url = await uploadUrl(key, contentType);

      return { url, key, publicUrl: mediaUrl(key), contentType };
    }),
};

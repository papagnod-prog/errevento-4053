import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, X } from "lucide-react";
import { client } from "../../lib/api";
import { cn } from "../../lib/utils";

const MAX_SIZE = 8 * 1024 * 1024;

async function uploadFile(file: File) {
  const { url, publicUrl, contentType } = await client.uploads.presign({
    filename: file.name,
    contentType: file.type || "image/jpeg",
  });
  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!response.ok) throw new Error("Caricamento non riuscito");
  return publicUrl;
}

export function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (list.length === 0) return;
    const tooBig = list.filter((file) => file.size > MAX_SIZE);
    const valid = list.filter((file) => file.size <= MAX_SIZE);
    setError(tooBig.length > 0 ? "Alcune immagini superano 8 MB e sono state saltate." : "");

    setBusy((n) => n + valid.length);
    const uploaded: string[] = [];
    for (const file of valid) {
      try {
        uploaded.push(await uploadFile(file));
      } catch {
        setError("Una immagine non è stata caricata. Riprova.");
      } finally {
        setBusy((n) => Math.max(0, n - 1));
      }
    }
    if (uploaded.length > 0) onChange([...images, ...uploaded]);
  };

  const move = (index: number, delta: number) => {
    const next = [...images];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  };

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center border border-dashed px-6 py-9 text-center transition-colors",
          dragging ? "border-accent bg-blush/40" : "border-border bg-background",
        )}
      >
        <ImagePlus className="h-6 w-6 text-muted-foreground" strokeWidth={1.3} />
        <p className="mt-3 text-sm text-ink">Trascina qui le foto</p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG o WebP fino a 8 MB. La prima è la copertina.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="link-underline mt-4 text-[11px] uppercase tracking-[0.24em] text-ink"
        >
          Scegli dal dispositivo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) void addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {busy > 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Caricamento di {busy}{" "}
          {busy === 1 ? "immagine" : "immagini"}…
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      {images.length > 0 ? (
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => (
            <li key={`${url}-${index}`} className="group relative border border-border bg-card">
              <img
                src={url}
                alt=""
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
              {index === 0 ? (
                <span className="absolute left-0 top-0 bg-ink px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-background">
                  Copertina
                </span>
              ) : null}
              <div className="flex items-center justify-between border-t border-border px-1.5 py-1.5">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    aria-label="Sposta a sinistra"
                    onClick={() => move(index, -1)}
                    className="p-1 text-muted-foreground hover:text-ink"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Sposta a destra"
                    onClick={() => move(index, 1)}
                    className="p-1 text-muted-foreground hover:text-ink"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Usa come copertina"
                    onClick={() => makeCover(index)}
                    className={cn(
                      "p-1 hover:text-gold",
                      index === 0 ? "text-gold" : "text-muted-foreground",
                    )}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Rimuovi immagine"
                  onClick={() => onChange(images.filter((_, i) => i !== index))}
                  className="p-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

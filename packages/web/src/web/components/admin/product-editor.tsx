import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { ActionButton, Field, inputClass } from "../ui/bits";
import { ImageUploader } from "./image-uploader";
import { useAdminCategories, useAdminProduct, useSaveProduct } from "../../queries/admin";
import { cn } from "../../lib/utils";

const AVAILABILITY = ["", "Disponibile", "Su richiesta", "Su ordinazione", "Esaurito"];

type Draft = {
  name: string;
  sku: string;
  price: string;
  availability: string;
  shortDescription: string;
  description: string;
  featured: boolean;
  sortOrder: string;
  categoryIds: number[];
  images: string[];
};

const EMPTY: Draft = {
  name: "",
  sku: "",
  price: "",
  availability: "",
  shortDescription: "",
  description: "",
  featured: false,
  sortOrder: "0",
  categoryIds: [],
  images: [],
};

export function ProductEditor({
  productId,
  onClose,
}: {
  productId: number | null;
  onClose: () => void;
}) {
  const isNew = productId === null;
  const existing = useAdminProduct(productId);
  const categories = useAdminCategories(true);
  const save = useSaveProduct();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    const data = existing.data;
    if (isNew || !data) return;
    setDraft({
      name: data.name,
      sku: data.sku,
      price: data.price === null ? "" : String(data.price),
      availability: data.availability,
      shortDescription: data.shortDescription,
      description: data.description,
      featured: data.featured,
      sortOrder: String(data.sortOrder),
      categoryIds: data.categoryIds,
      images: data.images,
    });
  }, [existing.data, isNew]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const parents = (categories.data ?? []).filter((c) => c.parentId === null);
  const loading = !isNew && existing.isLoading;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (save.isPending) return;
    if (draft.name.trim().length < 2) {
      setError("Il nome è obbligatorio.");
      return;
    }
    const priceValue = draft.price.trim().replace(",", ".");
    if (priceValue && Number.isNaN(Number(priceValue))) {
      setError("Il prezzo deve essere un numero.");
      return;
    }
    setError("");
    save.mutate(
      {
        id: productId ?? undefined,
        name: draft.name.trim(),
        sku: draft.sku.trim(),
        price: priceValue ? Number(priceValue) : null,
        availability: draft.availability,
        shortDescription: draft.shortDescription,
        description: draft.description,
        featured: draft.featured,
        sortOrder: Number(draft.sortOrder) || 0,
        categoryIds: draft.categoryIds,
        images: draft.images,
      },
      {
        onSuccess: onClose,
        onError: (err) => setError(err.message || "Salvataggio non riuscito."),
      },
    );
  };

  const toggleCategory = (id: number) =>
    set(
      "categoryIds",
      draft.categoryIds.includes(id)
        ? draft.categoryIds.filter((c) => c !== id)
        : [...draft.categoryIds, id],
    );

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto bg-ink/50 px-0 py-0 sm:px-5 sm:py-10">
      <div className="mx-auto w-full max-w-4xl border border-border bg-card">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4 sm:px-8">
          <h2 className="font-display text-2xl text-ink">
            {isNew ? "Nuovo prodotto" : "Modifica prodotto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="p-1 text-muted-foreground hover:text-ink"
          >
            <X className="h-5 w-5" strokeWidth={1.4} />
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={submit} className="px-5 py-8 sm:px-8">
            <div className="grid gap-7 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Nome prodotto">
                  <input
                    value={draft.name}
                    onChange={(event) => set("name", event.target.value)}
                    className={inputClass}
                    placeholder="Bomboniera in ceramica"
                  />
                </Field>
              </div>
              <Field label="Codice / SKU">
                <input
                  value={draft.sku}
                  onChange={(event) => set("sku", event.target.value)}
                  className={inputClass}
                  placeholder="ERR-1234"
                />
              </Field>
              <Field label="Prezzo in euro" hint="Lascia vuoto per non mostrarlo">
                <input
                  value={draft.price}
                  onChange={(event) => set("price", event.target.value)}
                  className={inputClass}
                  inputMode="decimal"
                  placeholder="12,50"
                />
              </Field>
              <Field label="Disponibilità">
                <select
                  value={draft.availability}
                  onChange={(event) => set("availability", event.target.value)}
                  className={inputClass}
                >
                  {AVAILABILITY.map((value) => (
                    <option key={value} value={value}>
                      {value || "Non indicata"}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ordine" hint="Numero più basso = più in alto nel catalogo">
                <input
                  value={draft.sortOrder}
                  onChange={(event) => set("sortOrder", event.target.value)}
                  className={inputClass}
                  inputMode="numeric"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Descrizione breve" hint="Una riga, mostrata sotto il nome">
                  <textarea
                    value={draft.shortDescription}
                    onChange={(event) => set("shortDescription", event.target.value)}
                    className={cn(inputClass, "min-h-16 resize-y")}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Descrizione completa">
                  <textarea
                    value={draft.description}
                    onChange={(event) => set("description", event.target.value)}
                    className={cn(inputClass, "min-h-40 resize-y")}
                  />
                </Field>
              </div>
            </div>

            <label className="mt-8 flex items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) => set("featured", event.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Metti in evidenza nella home
            </label>

            <div className="mt-10">
              <span className="eyebrow block text-[10px]">Categorie</span>
              {categories.isLoading ? (
                <div className="mt-4 h-20 animate-pulse bg-muted" />
              ) : (
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {parents.map((parent) => {
                    const children = (categories.data ?? []).filter(
                      (c) => c.parentId === parent.id,
                    );
                    return (
                      <div key={parent.id}>
                        <label className="flex items-center gap-2.5 text-sm text-ink">
                          <input
                            type="checkbox"
                            checked={draft.categoryIds.includes(parent.id)}
                            onChange={() => toggleCategory(parent.id)}
                            className="h-4 w-4 accent-[var(--accent)]"
                          />
                          {parent.name}
                        </label>
                        {children.length > 0 ? (
                          <div className="mt-2 space-y-1.5 border-l border-border pl-4">
                            {children.map((child) => (
                              <label
                                key={child.id}
                                className="flex items-center gap-2.5 text-sm text-muted-foreground"
                              >
                                <input
                                  type="checkbox"
                                  checked={draft.categoryIds.includes(child.id)}
                                  onChange={() => toggleCategory(child.id)}
                                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                                />
                                {child.name}
                              </label>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-10">
              <span className="eyebrow block text-[10px]">Immagini</span>
              <div className="mt-4">
                <ImageUploader
                  images={draft.images}
                  onChange={(next) => set("images", next)}
                />
              </div>
            </div>

            {error ? <p className="mt-6 text-sm text-destructive">{error}</p> : null}

            <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-border pt-8">
              <ActionButton type="submit" disabled={save.isPending}>
                {save.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isNew ? (
                  "Crea prodotto"
                ) : (
                  "Salva modifiche"
                )}
              </ActionButton>
              <button
                type="button"
                onClick={onClose}
                className="link-underline text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
              >
                Annulla
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

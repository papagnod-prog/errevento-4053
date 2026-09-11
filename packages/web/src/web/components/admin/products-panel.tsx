import { useState } from "react";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { ActionButton, inputClass } from "../ui/bits";
import { ProductEditor } from "./product-editor";
import {
  useAdminCategories,
  useAdminProducts,
  useDeleteProduct,
  useToggleFeatured,
  type AdminProductFilters,
} from "../../queries/admin";
import { formatPrice } from "../../lib/site";
import { cn } from "../../lib/utils";

export function ProductsPanel() {
  const [filters, setFilters] = useState<AdminProductFilters>({
    search: "",
    categoryId: null,
    sort: "recenti",
    page: 1,
  });
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const products = useAdminProducts(filters, true);
  const categories = useAdminCategories(true);
  const remove = useDeleteProduct();
  const toggleFeatured = useToggleFeatured();

  const patch = (next: Partial<AdminProductFilters>) =>
    setFilters((current) => ({ ...current, page: 1, ...next }));

  const data = products.data;

  return (
    <section className="border border-border bg-card px-5 py-8 sm:px-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Prodotti</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {data ? `${data.total} prodotti in catalogo` : "Caricamento…"}
          </p>
        </div>
        <ActionButton type="button" onClick={() => setEditing("new")} className="px-6 py-3">
          <Plus className="h-4 w-4" /> Nuovo prodotto
        </ActionButton>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <label className="relative block sm:col-span-1">
          <span className="eyebrow block text-[10px]">Cerca</span>
          <Search className="pointer-events-none absolute bottom-3 right-0 h-4 w-4 text-muted-foreground" />
          <input
            value={filters.search}
            onChange={(event) => patch({ search: event.target.value })}
            className={inputClass}
            placeholder="Nome o codice"
          />
        </label>
        <label className="block">
          <span className="eyebrow block text-[10px]">Categoria</span>
          <select
            value={filters.categoryId ?? ""}
            onChange={(event) =>
              patch({ categoryId: event.target.value ? Number(event.target.value) : null })
            }
            className={inputClass}
          >
            <option value="">Tutte</option>
            {(categories.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.parentId === null ? category.name : `— ${category.name}`}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow block text-[10px]">Ordina</span>
          <select
            value={filters.sort}
            onChange={(event) =>
              patch({ sort: event.target.value as AdminProductFilters["sort"] })
            }
            className={inputClass}
          >
            <option value="recenti">Aggiunti per ultimi</option>
            <option value="nome">Nome A-Z</option>
            <option value="ordine">Ordine catalogo</option>
          </select>
        </label>
      </div>

      {products.isLoading ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse bg-muted" />
          ))}
        </div>
      ) : products.isError ? (
        <p className="mt-8 text-sm text-destructive">
          Non riesco a leggere i prodotti. Prova a ricaricare la pagina.
        </p>
      ) : !data?.items.length ? (
        <p className="mt-8 text-sm text-muted-foreground">Nessun prodotto trovato.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {data.items.map((product) => (
            <li key={product.id} className="flex items-center gap-4 py-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden border border-border bg-background">
                {product.primaryImage ? (
                  <img
                    src={product.primaryImage}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-ink">{product.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[
                    product.sku || null,
                    product.price !== null ? formatPrice(product.price) : null,
                    product.availability || null,
                    product.categorySlugs.split(",").filter(Boolean).join(" · ") || null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Nessun dettaglio"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Metti in evidenza"
                  onClick={() =>
                    toggleFeatured.mutate({ id: product.id, featured: !product.featured })
                  }
                  className={cn(
                    "p-2 transition-colors hover:text-gold",
                    product.featured ? "text-gold" : "text-muted-foreground",
                  )}
                >
                  <Star
                    className="h-4 w-4"
                    strokeWidth={1.4}
                    fill={product.featured ? "currentColor" : "none"}
                  />
                </button>
                <Link
                  to={`/prodotto/${product.slug}`}
                  className="hidden p-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-ink sm:block"
                >
                  Vedi
                </Link>
                <button
                  type="button"
                  aria-label="Modifica"
                  onClick={() => setEditing(product.id)}
                  className="p-2 text-muted-foreground hover:text-ink"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.4} />
                </button>
                <button
                  type="button"
                  aria-label="Elimina"
                  onClick={() => setConfirmDelete(product.id)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.4} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => setFilters((c) => ({ ...c, page: c.page - 1 }))}
            className="p-2 text-muted-foreground disabled:opacity-30"
            aria-label="Pagina precedente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {data.page} / {data.totalPages}
          </span>
          <button
            type="button"
            disabled={data.page >= data.totalPages}
            onClick={() => setFilters((c) => ({ ...c, page: c.page + 1 }))}
            className="p-2 text-muted-foreground disabled:opacity-30"
            aria-label="Pagina successiva"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {editing !== null ? (
        <ProductEditor
          productId={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {confirmDelete !== null ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-ink/50 px-5">
          <div className="w-full max-w-sm border border-border bg-card px-7 py-8 text-center">
            <h3 className="font-display text-2xl text-ink">Eliminare il prodotto?</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              L'operazione è definitiva: sparisce dal catalogo insieme alle sue immagini.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <ActionButton
                type="button"
                disabled={remove.isPending}
                onClick={() =>
                  remove.mutate(
                    { id: confirmDelete },
                    { onSuccess: () => setConfirmDelete(null) },
                  )
                }
              >
                {remove.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sì, elimina"
                )}
              </ActionButton>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="link-underline mx-auto text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

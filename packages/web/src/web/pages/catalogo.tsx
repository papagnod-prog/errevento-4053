import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "wouter";
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "../components/product-card";
import { Eyebrow, Ornament } from "../components/ui/bits";
import { useCategories, useProducts, type CatalogSort } from "../queries/catalog";
import { useReveal } from "../hooks/use-reveal";
import { cn } from "../lib/utils";

const SORTS: { value: CatalogSort; label: string }[] = [
  { value: "default", label: "Ordine consigliato" },
  { value: "name-asc", label: "Nome A → Z" },
  { value: "price-asc", label: "Prezzo crescente" },
  { value: "price-desc", label: "Prezzo decrescente" },
];

const PAGE_SIZE = 24;

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  return (
    <nav className="mt-20 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Pagina precedente"
        className="flex h-10 w-10 items-center justify-center border border-border text-ink transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-border"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.3} />
      </button>
      {list.map((item, index) => (
        <span key={item} className="flex items-center gap-2">
          {index > 0 && item - list[index - 1] > 1 ? (
            <span className="px-1 text-muted-foreground">…</span>
          ) : null}
          <button
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              "flex h-10 min-w-10 items-center justify-center border px-3 font-body text-[12px] transition-colors",
              item === page
                ? "border-ink bg-ink text-background"
                : "border-border text-ink hover:border-ink",
            )}
          >
            {item}
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Pagina successiva"
        className="flex h-10 w-10 items-center justify-center border border-border text-ink transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-border"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.3} />
      </button>
    </nav>
  );
}

function CategoryFilters({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (slug: string) => void;
}) {
  const categories = useCategories();
  const [open, setOpen] = useState<number | null>(null);

  const activeParent = useMemo(() => {
    for (const parent of categories.data ?? []) {
      if (parent.slug === active) return parent.id;
      if (parent.children.some((child) => child.slug === active)) return parent.id;
    }
    return null;
  }, [categories.data, active]);

  useEffect(() => {
    if (activeParent !== null) setOpen(activeParent);
  }, [activeParent]);

  return (
    <div>
      <p className="eyebrow">Categorie</p>
      <ul className="mt-5 space-y-1">
        <li>
          <button
            type="button"
            onClick={() => onSelect("tutti")}
            className={cn(
              "w-full py-1.5 text-left font-body text-[14px] transition-colors",
              active === "tutti" ? "text-accent" : "text-ink/80 hover:text-accent",
            )}
          >
            Tutti gli articoli
          </button>
        </li>
        {(categories.data ?? []).map((parent) => (
          <li key={parent.id}>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onSelect(parent.slug)}
                className={cn(
                  "flex-1 py-1.5 text-left font-body text-[14px] transition-colors",
                  active === parent.slug ? "text-accent" : "text-ink/80 hover:text-accent",
                )}
              >
                {parent.name}
                <span className="ml-2 text-[11px] text-muted-foreground">
                  {parent.productCount}
                </span>
              </button>
              {parent.children.length > 0 ? (
                <button
                  type="button"
                  aria-label={`Mostra sottocategorie di ${parent.name}`}
                  onClick={() => setOpen((v) => (v === parent.id ? null : parent.id))}
                  className="p-1 text-muted-foreground transition-transform duration-300"
                  style={{
                    transform: open === parent.id ? "rotate(180deg)" : "none",
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.4} />
                </button>
              ) : null}
            </div>
            {parent.children.length > 0 && open === parent.id ? (
              <ul className="mb-2 ml-3 space-y-0.5 border-l border-border pl-4">
                {parent.children.map((child) => (
                  <li key={child.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(child.slug)}
                      className={cn(
                        "w-full py-1 text-left font-body text-[13px] transition-colors",
                        active === child.slug
                          ? "text-accent"
                          : "text-muted-foreground hover:text-accent",
                      )}
                    >
                      {child.name}
                      <span className="ml-2 text-[10px] opacity-70">
                        {child.productCount}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CatalogoPage() {
  const [params, setParams] = useSearchParams();

  const category = params.get("categoria") ?? "tutti";
  const search = params.get("q") ?? "";
  const sort = (params.get("ordine") as CatalogSort | null) ?? "default";
  const page = Number(params.get("pagina") ?? "1") || 1;

  const [term, setTerm] = useState(search);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => setTerm(search), [search]);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "" || value === "tutti" || value === "default") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    if (!("pagina" in changes)) next.delete("pagina");
    setParams(next);
    setFiltersOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const products = useProducts({
    category: category === "tutti" ? undefined : category,
    search: search || undefined,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  useReveal(products.data);

  const heading = products.data?.categoryName ?? "Il catalogo";
  const total = products.data?.total ?? 0;

  return (
    <>
      <section className="bg-blush/60 pb-16 pt-36 lg:pb-20 lg:pt-44">
        <div className="mx-auto max-w-[1240px] px-5 text-center lg:px-8">
          <Eyebrow>Errevento — collezioni</Eyebrow>
          <h1 className="display-lg mt-5 text-ink">{heading}</h1>
          <Ornament className="mt-6" />
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Una vetrina da sfogliare: scegliete gli articoli che vi piacciono e richiedete
            informazioni su disponibilità, colori e personalizzazioni.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              update({ q: term.trim() });
            }}
            className="mx-auto mt-10 flex max-w-xl items-center gap-3 border-b border-blush-deep pb-2"
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.3} />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Cerca per nome o codice articolo…"
              className="flex-1 border-0 bg-transparent py-1 text-[15px] text-ink outline-none placeholder:text-muted-foreground/70"
            />
            {search ? (
              <button
                type="button"
                aria-label="Azzera la ricerca"
                onClick={() => update({ q: null })}
                className="text-muted-foreground hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.3} />
              </button>
            ) : null}
            <button
              type="submit"
              className="font-body text-[11px] uppercase tracking-[0.22em] text-accent"
            >
              Cerca
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex w-full items-center justify-between border-y border-border py-3 font-body text-[11px] uppercase tracking-[0.22em] text-ink lg:hidden"
            >
              Filtra per categoria
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  filtersOpen && "rotate-180",
                )}
                strokeWidth={1.4}
              />
            </button>
            <div className={cn("mt-6 lg:mt-0 lg:block", filtersOpen ? "block" : "hidden")}>
              <CategoryFilters active={category} onSelect={(slug) => update({ categoria: slug })} />
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <p className="font-body text-[13px] text-muted-foreground">
                {products.isLoading
                  ? "Caricamento…"
                  : total === 0
                    ? "Nessun articolo trovato"
                    : `${total} articoli${search ? ` per “${search}”` : ""}`}
              </p>
              <label className="flex items-center gap-3">
                <span className="eyebrow text-[9.5px]">Ordina</span>
                <select
                  value={sort}
                  onChange={(event) => update({ ordine: event.target.value })}
                  className="border-0 bg-transparent py-1 font-body text-[13px] text-ink outline-none"
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {products.isError ? (
              <p className="py-24 text-center text-muted-foreground">
                Si è verificato un errore nel caricamento del catalogo.
              </p>
            ) : null}

            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:gap-x-10">
              {products.isLoading
                ? Array.from({ length: 9 }, (_, i) => <ProductCardSkeleton key={i} />)
                : (products.data?.items ?? []).map((product, index) => (
                    <div
                      key={product.id}
                      className="reveal"
                      style={{ transitionDelay: `${(index % 3) * 80}ms` }}
                    >
                      <ProductCard product={product} eager={index < 6} />
                    </div>
                  ))}
            </div>

            {!products.isLoading && total === 0 ? (
              <div className="py-20 text-center">
                <p className="font-display text-2xl text-ink">Nessun risultato</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Provate con un altro termine o sfogliate tutte le categorie.
                </p>
                <button
                  type="button"
                  onClick={() => update({ q: null, categoria: null })}
                  className="mt-7 border border-ink px-7 py-3 font-body text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-background"
                >
                  Azzera i filtri
                </button>
              </div>
            ) : null}

            <Pagination
              page={page}
              totalPages={products.data?.totalPages ?? 0}
              onChange={(next) => update({ pagina: String(next) })}
            />
          </div>
        </div>
      </section>
    </>
  );
}

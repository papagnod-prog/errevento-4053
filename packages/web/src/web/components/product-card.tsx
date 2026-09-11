import { Link } from "wouter";
import { categoryLabel, formatPrice } from "../lib/site";
import { useSiteSettings } from "../queries/settings";
import { cn } from "../lib/utils";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  primaryImage: string;
  categorySlugs: string;
};

export function ProductCard({
  product,
  className,
  eager = false,
}: {
  product: ProductCardData;
  className?: string;
  eager?: boolean;
}) {
  const settings = useSiteSettings();
  const showPrices = settings.data?.showPrices ?? true;
  const price = formatPrice(product.price);

  return (
    <Link
      to={`/prodotto/${product.slug}`}
      className={cn("group block text-center", className)}
    >
      <div className="relative overflow-hidden bg-muted">
        <div className="aspect-4/5 w-full">
          {product.primaryImage ? (
            <img
              src={product.primaryImage}
              alt={product.name}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          ) : null}
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="bg-background/95 px-5 py-2 font-body text-[10px] uppercase tracking-[0.24em] text-ink">
            Scopri
          </span>
        </div>
      </div>
      <p className="eyebrow mt-5 text-[9.5px]">{categoryLabel(product.categorySlugs)}</p>
      <h3 className="mx-auto mt-2 max-w-[15rem] font-display text-[19px] leading-snug text-ink transition-colors group-hover:text-accent">
        {product.name}
      </h3>
      {showPrices && price ? (
        <p className="mt-2 font-display text-[15px] text-accent">{price}</p>
      ) : (
        <p className="mt-2 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Su richiesta
        </p>
      )}
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse text-center">
      <div className="aspect-4/5 w-full bg-muted" />
      <div className="mx-auto mt-5 h-2 w-16 bg-muted" />
      <div className="mx-auto mt-3 h-3 w-32 bg-muted" />
      <div className="mx-auto mt-3 h-3 w-14 bg-muted" />
    </div>
  );
}

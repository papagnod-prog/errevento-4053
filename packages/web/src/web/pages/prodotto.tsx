import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, MessageCircle, Ruler, Store, Truck } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useProduct } from "../queries/catalog";
import { useSiteSettings } from "../queries/settings";
import { InquiryDialog } from "../components/inquiry-form";
import { ProductCard } from "../components/product-card";
import { ActionButton, Ornament, SectionHeading } from "../components/ui/bits";
import { formatPrice } from "../lib/site";
import { useReveal } from "../hooks/use-reveal";
import { cn } from "../lib/utils";

const NOTES = [
  {
    icon: Store,
    title: "Da vedere in negozio",
    text: "Il catalogo è una vetrina: in negozio trovate campioni, colori e finiture.",
  },
  {
    icon: Ruler,
    title: "Personalizzabile",
    text: "Nastri, targhette, incisioni e confezioni si adattano al vostro evento.",
  },
  {
    icon: Truck,
    title: "Disponibilità su richiesta",
    text: "Confermiamo quantità e tempi di consegna prima di ogni ordine.",
  },
];

export default function ProdottoPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useProduct(slug);
  const settings = useSiteSettings();
  const [activeImage, setActiveImage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => setActiveImage(0), [slug]);
  useReveal(product.data?.id);

  const showPrices = settings.data?.showPrices ?? true;
  const whatsapp = settings.data?.whatsappNumber ?? "393391299927";

  if (product.isLoading) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-36 lg:px-8 lg:pt-44">
        <div className="grid animate-pulse gap-14 lg:grid-cols-2">
          <div className="aspect-4/5 w-full bg-muted" />
          <div className="space-y-5">
            <div className="h-3 w-24 bg-muted" />
            <div className="h-9 w-3/4 bg-muted" />
            <div className="h-3 w-full bg-muted" />
            <div className="h-3 w-5/6 bg-muted" />
            <div className="h-12 w-56 bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (product.isError || !product.data) {
    return (
      <div className="mx-auto max-w-xl px-5 py-48 text-center">
        <h1 className="display-lg text-ink">Articolo non trovato</h1>
        <Ornament className="mt-6" />
        <p className="mt-6 text-muted-foreground">
          Potrebbe essere stato spostato o rinominato.
        </p>
        <Link
          to="/catalogo"
          className="mt-9 inline-block border border-ink px-8 py-3.5 font-body text-[11px] uppercase tracking-[0.24em] text-ink transition-colors hover:bg-ink hover:text-background"
        >
          Torna al catalogo
        </Link>
      </div>
    );
  }

  const item = product.data;
  const price = formatPrice(item.price);
  const images = item.images.length > 0 ? item.images : [item.primaryImage].filter(Boolean);
  const mainCategory = item.categories.find((c) => c.parentId === null) ?? item.categories[0];
  const paragraphs = item.description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <>
      <div className="mx-auto max-w-[1240px] px-5 pt-32 lg:px-8 lg:pt-40">
        <nav className="flex flex-wrap items-center gap-2 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <Link to="/catalogo" className="flex items-center gap-1.5 hover:text-accent">
            <ArrowLeft className="h-3 w-3" strokeWidth={1.5} /> Catalogo
          </Link>
          {mainCategory ? (
            <>
              <span className="opacity-50">/</span>
              <Link
                to={`/catalogo?categoria=${mainCategory.slug}`}
                className="hover:text-accent"
              >
                {mainCategory.name}
              </Link>
            </>
          ) : null}
        </nav>
      </div>

      <section className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="reveal">
            <div className="overflow-hidden bg-muted">
              <div className="aspect-4/5 w-full">
                {images[activeImage] ? (
                  <img
                    src={images[activeImage]}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            </div>
            {images.length > 1 ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Immagine ${index + 1}`}
                    className={cn(
                      "h-20 w-16 overflow-hidden border transition-colors",
                      index === activeImage ? "border-accent" : "border-transparent hover:border-blush-deep",
                    )}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:pt-6">
            <p className="eyebrow reveal">{mainCategory?.name ?? "Catalogo"}</p>
            <h1 className="reveal mt-4 font-display text-[34px] leading-tight text-ink lg:text-[44px]">
              {item.name}
            </h1>

            <div className="reveal mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {showPrices && price ? (
                <p className="font-display text-3xl text-accent">{price}</p>
              ) : (
                <p className="font-body text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
                  Prezzo su richiesta
                </p>
              )}
              {showPrices && price ? (
                <span className="text-xs text-muted-foreground">iva inclusa</span>
              ) : null}
              {item.sku ? (
                <span className="font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Cod. {item.sku}
                </span>
              ) : null}
              {item.availability ? (
                <span className="border border-border px-3 py-1 font-body text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {item.availability}
                </span>
              ) : null}
            </div>

            {paragraphs.length > 0 ? (
              <div className="reveal mt-9 space-y-4 border-t border-border pt-9 text-[15px] leading-relaxed text-muted-foreground">
                {paragraphs.slice(0, 6).map((line) => (
                  <p key={line.slice(0, 40)}>{line}</p>
                ))}
              </div>
            ) : null}

            <div className="reveal mt-10 flex flex-col gap-3 sm:flex-row">
              <ActionButton
                type="button"
                variant="whatsapp"
                onClick={() => setDialogOpen(true)}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} /> Richiedi informazioni
              </ActionButton>
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  `Ciao Errevento, vorrei informazioni su: ${item.name}${item.sku ? ` (cod. ${item.sku})` : ""}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-ink/50 px-8 py-3.5 font-body text-[11px] uppercase tracking-[0.24em] text-ink transition-colors hover:bg-ink hover:text-background"
              >
                <SiWhatsapp className="h-4 w-4" /> Chat diretta
              </a>
            </div>
            <p className="reveal mt-4 text-xs leading-relaxed text-muted-foreground">
              Nessun acquisto online: verifichiamo insieme disponibilità, quantità e
              personalizzazioni.
            </p>

            <div className="reveal mt-12 space-y-6 border-t border-border pt-10">
              {NOTES.map((note) => (
                <div key={note.title} className="flex gap-4">
                  <note.icon className="mt-1 h-[18px] w-[18px] shrink-0 text-gold" strokeWidth={1.2} />
                  <div>
                    <p className="font-display text-lg text-ink">{note.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {note.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {item.categories.length > 0 ? (
              <div className="reveal mt-10 flex flex-wrap gap-2 border-t border-border pt-8">
                {item.categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/catalogo?categoria=${category.slug}`}
                    className="border border-border px-4 py-1.5 font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {item.related.length > 0 ? (
        <section className="border-t border-border bg-blush/40 py-20 lg:py-28">
          <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
            <SectionHeading eyebrow="Da abbinare" title="Potrebbero piacervi" />
            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-10">
              {item.related.map((related, index) => (
                <div
                  key={related.id}
                  className="reveal"
                  style={{ transitionDelay: `${(index % 4) * 80}ms` }}
                >
                  <ProductCard product={related} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <InquiryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        source="prodotto"
        productId={item.id}
        productName={item.name}
      />
    </>
  );
}

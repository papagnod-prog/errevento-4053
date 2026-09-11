import { Link } from "wouter";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp } from "react-icons/si";
import { NAV, SITE } from "../lib/site";
import { useCategories } from "../queries/catalog";
import { useSiteSettings } from "../queries/settings";
import { Ornament } from "./ui/bits";

export function SiteFooter() {
  const categories = useCategories();
  const settings = useSiteSettings();
  const whatsapp = `https://wa.me/${settings.data?.whatsappNumber ?? "393391299927"}`;

  return (
    <footer className="border-t border-border bg-blush/50">
      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="text-center">
          <p className="font-display text-3xl uppercase tracking-[0.3em] text-ink">
            Errevento
          </p>
          <Ornament className="mt-5" />
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Dal {SITE.since} curiamo nel dettaglio ogni evento: bomboniere, partecipazioni,
            confettate e allestimenti su misura.
          </p>
        </div>

        <div className="mt-16 grid gap-12 border-t border-blush-deep/60 pt-12 text-center sm:grid-cols-3 sm:text-left">
          <div>
            <p className="eyebrow">Il catalogo</p>
            <ul className="mt-5 space-y-2.5">
              {(categories.data ?? []).slice(0, 5).map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/catalogo?categoria=${category.slug}`}
                    className="text-sm text-ink/80 transition-colors hover:text-accent"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Pagine</p>
            <ul className="mt-5 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-sm text-ink/80 transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Dove siamo</p>
            <ul className="mt-5 space-y-3 text-sm text-ink/80">
              <li className="flex items-start justify-center gap-2.5 sm:justify-start">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={1.3} />
                <a href={SITE.mapsUrl} target="_blank" rel="noreferrer">
                  {SITE.address}
                  <br />
                  {SITE.city}
                </a>
              </li>
              <li className="flex items-center justify-center gap-2.5 sm:justify-start">
                <Phone className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.3} />
                <a href={SITE.phoneHref}>{SITE.phone}</a>
              </li>
              <li className="flex items-center justify-center gap-2.5 sm:justify-start">
                <Mail className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.3} />
                <a href={`mailto:${settings.data?.contactEmail ?? SITE.email}`}>
                  {settings.data?.contactEmail ?? SITE.email}
                </a>
              </li>
            </ul>
            <div className="mt-6 flex items-center justify-center gap-5 sm:justify-start">
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="text-ink/70 transition-colors hover:text-accent"
              >
                <SiWhatsapp className="h-[18px] w-[18px]" />
              </a>
              <a
                href="https://www.instagram.com/errevento/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-ink/70 transition-colors hover:text-accent"
              >
                <SiInstagram className="h-[18px] w-[18px]" />
              </a>
              <a
                href="https://www.facebook.com/errevento/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-ink/70 transition-colors hover:text-accent"
              >
                <SiFacebook className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-blush-deep/60 pt-8 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} {SITE.legalName} — P.IVA {SITE.vat}
          </p>
          <p>
            Catalogo consultabile: i prezzi sono indicativi, la disponibilità va confermata
            in negozio o via WhatsApp.
          </p>
          <p className="flex items-center gap-4">
            <Link to="/privacy-policy" className="transition-colors hover:text-accent">
              Privacy Policy
            </Link>
            <Link to="/cookie-policy" className="transition-colors hover:text-accent">
              Cookie Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

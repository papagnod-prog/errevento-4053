import { useEffect } from "react";
import { useLocation } from "wouter";
import { SiWhatsapp } from "react-icons/si";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { useSiteSettings } from "../queries/settings";

/**
 * Normalizza lo slash finale e mantiene aggiornato il link canonical, così i
 * vecchi indirizzi WordPress (che finivano tutti con "/") non generano
 * contenuti duplicati agli occhi dei motori di ricerca.
 */
function useCanonicalUrl() {
  const [location] = useLocation();
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const clean = pathname.replace(/\/+$/, "");
    if (clean && clean !== pathname) {
      window.history.replaceState(null, "", `${clean}${search}${hash}`);
    }
    const path = clean || "/";
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}${path}${search}`;
  }, [location]);
}

/** Riporta la pagina in alto a ogni cambio di rotta */
function useScrollTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location]);
}

export function Layout({ children }: { children: React.ReactNode }) {
  useScrollTop();
  useCanonicalUrl();
  const settings = useSiteSettings();
  const number = settings.data?.whatsappNumber ?? "393391299927";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <a
        href={`https://wa.me/${number}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Scrivici su WhatsApp"
        className="fixed bottom-6 right-5 z-80 flex h-13 w-13 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-ink/20 transition-transform duration-300 hover:scale-105 lg:bottom-8 lg:right-8"
      >
        <SiWhatsapp className="h-6 w-6" />
      </a>
    </div>
  );
}

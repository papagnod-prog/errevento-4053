import { useEffect } from "react";
import { useLocation } from "wouter";
import { resolveLegacyPath } from "../lib/legacy-redirects";
import { ButtonLink } from "./ui/bits";

function NotFoundView() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <section className="mx-auto max-w-xl px-5 pb-32 pt-44 text-center">
      <p className="font-display text-6xl text-gold">404</p>
      <h1 className="display-lg mt-6 text-ink">Pagina non trovata</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
        La pagina che cercavi non esiste più o l'indirizzo è cambiato.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <ButtonLink to="/">Torna alla home</ButtonLink>
        <ButtonLink to="/catalogo" variant="outline">
          Vai al catalogo
        </ButtonLink>
      </div>
    </section>
  );
}

/**
 * Catch-all: normalizza lo slash finale e reindirizza i vecchi URL WordPress /
 * WooCommerce verso la pagina corrispondente del nuovo sito. Se non esiste una
 * destinazione sensata mostra la 404 con meta noindex.
 */
export function LegacyRedirect() {
  const [location, navigate] = useLocation();
  const search = typeof window === "undefined" ? "" : window.location.search;

  const trimmed = location.replace(/\/+$/, "");
  const normalized = trimmed !== location && trimmed.length > 0 ? trimmed : null;
  const target = normalized ? null : resolveLegacyPath(location);

  useEffect(() => {
    if (normalized) {
      navigate(`${normalized}${search}`, { replace: true });
      return;
    }
    if (target) navigate(target, { replace: true });
  }, [normalized, target, search, navigate]);

  if (normalized || target) {
    return (
      <section className="mx-auto max-w-xl px-5 pb-32 pt-44 text-center">
        <p className="text-[15px] text-muted-foreground">Reindirizzamento in corso…</p>
      </section>
    );
  }

  return <NotFoundView />;
}

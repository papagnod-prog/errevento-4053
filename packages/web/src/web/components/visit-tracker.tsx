import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Segnala al server ogni pagina vista, per il tasso di conversione
 * visite -> richieste nel pannello. Nessun cookie, nessun dato personale.
 * Il pannello (/admin) non viene contato.
 */
export function VisitTracker() {
  const [location] = useLocation();

  useEffect(() => {
    if (location.startsWith("/admin")) return;
    const controller = new AbortController();
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // statistica non essenziale: in caso di errore si ignora
    });
    return () => controller.abort();
  }, [location]);

  return null;
}

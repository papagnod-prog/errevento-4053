import { useEffect, useRef, useState } from "react";

/**
 * Riquadro di conferma "non sono un robot" (Cloudflare Turnstile).
 *
 * Due scelte volute:
 *  - lo script di Cloudflare si scarica solo quando questo componente compare,
 *    cioè quando qualcuno apre il modulo richieste: nessuna chiamata a terzi
 *    nella normale navigazione del sito;
 *  - senza la chiave pubblica il componente non rende nulla e non carica
 *    niente, così il modulo funziona anche se il captcha non è configurato.
 */

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

/** true quando il captcha è configurato per questa build. */
export const captchaEnabled = Boolean(SITE_KEY);

type TurnstileOptions = {
  sitekey: string;
  language?: string;
  theme?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: TurnstileOptions) => string | undefined;
      remove: (id: string) => void;
    };
  }
}

let loader: Promise<void> | null = null;

function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!loader) {
    loader = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loader = null;
        reject(new Error("Turnstile non caricato"));
      };
      document.head.appendChild(script);
    });
  }
  return loader;
}

/** Chiama `onToken` con l'esito del captcha, o con "" quando scade. */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const holder = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!SITE_KEY) return;
    let widgetId: string | undefined;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !holder.current || !window.turnstile) return;
        widgetId = window.turnstile.render(holder.current, {
          sitekey: SITE_KEY,
          language: "it",
          callback: (token) => callback.current(token),
          "expired-callback": () => callback.current(""),
          "error-callback": () => {
            callback.current("");
            setUnavailable(true);
          },
        });
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // il riquadro è già stato rimosso insieme alla pagina
        }
      }
    };
  }, []);

  if (!SITE_KEY) return null;

  return (
    <div className="mt-6">
      <div ref={holder} />
      {unavailable ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          La verifica antispam non si è caricata. Puoi inviare comunque: ti
          risponderemo appena controlliamo la richiesta.
        </p>
      ) : null}
    </div>
  );
}

import { useState } from "react";
import { MapPin } from "lucide-react";
import { SITE } from "../lib/site";
import { ActionButton } from "./ui/bits";

const EMBED_SRC =
  "https://www.google.com/maps?q=Via%20Aldo%20Moro%2097,%2070033%20Corato%20BA&output=embed";

/**
 * Mappa a caricamento consensuale (click-to-load).
 *
 * L'iframe di Google Maps viene inserito nella pagina solo dopo un'azione
 * esplicita del visitatore: finché il pulsante non viene premuto, il browser
 * non contatta alcun server di Google e nessun dato — indirizzo IP compreso —
 * lascia il sito. Questo evita un trasferimento verso terze parti privo di
 * base giuridica e rende superfluo un banner di consenso.
 */
export function MapEmbed() {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <div className="overflow-hidden border border-border">
        <iframe
          title="Mappa di Errevento a Corato"
          src={EMBED_SRC}
          className="h-[380px] w-full lg:h-[460px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return (
    <div className="flex h-[380px] w-full flex-col items-center justify-center gap-5 border border-border bg-blush/40 px-6 text-center lg:h-[460px]">
      <MapPin className="h-7 w-7 text-accent" strokeWidth={1.3} aria-hidden="true" />
      <div>
        <p className="font-display text-2xl text-ink">
          {SITE.address} — {SITE.city}
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          La mappa è fornita da Google Maps. Caricandola, il tuo indirizzo IP viene
          comunicato a Google: per questo la mostriamo solo se scegli di aprirla.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ActionButton type="button" variant="outline" onClick={() => setLoaded(true)}>
          Mostra la mappa
        </ActionButton>
        <a
          href={SITE.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="link-underline text-sm text-accent"
        >
          Apri in Google Maps
        </a>
      </div>
    </div>
  );
}

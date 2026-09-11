# Errevento — Design

Sito vetrina + catalogo consultabile (755 prodotti) per Errevento di Rossella Ferrucci, Corato (BA): bomboniere, partecipazioni, confettate, allestimenti e wedding planning. **Nessun ecommerce**: nessun carrello, nessun checkout. Ogni prodotto porta a una richiesta informazioni via WhatsApp preceduta da un breve form.

Direzione visiva (dall'immagine di riferimento fornita dal cliente): editoriale romantico, fondo rosa cipria/avorio, titoli serif molto grandi in maiuscoletto largo, testo centrato, tanta aria, nessuna card con bordi o ombre marcate. Le fotografie sono l'unico elemento "pieno" della pagina.

## Brand & Colors

CSS variables in `packages/web/src/web/styles.css`. Solo tema chiaro (nessun dark mode: il brand è luce e cipria).

| Token | Valore | Uso |
|-------|--------|-----|
| background | #FAF6F3 | Fondo pagina (avorio caldo) |
| blush | #EFDCD6 | Fasce/sezioni rosa cipria, hero |
| blush-deep | #E3C6BE | Divisori, hover, stati attivi |
| ink | #2E2622 | Testo primario, titoli |
| muted-foreground | #8C7C75 | Testo secondario, meta, SKU |
| accent | #A9736A | Link, prezzi, piccoli dettagli (terracotta rosata) |
| gold | #B99364 | Filetti decorativi, ornamenti |
| border | #E7DAD4 | Hairline 1px |
| whatsapp | #25D366 | Solo il pulsante WhatsApp |

## Typography

- **Display**: Cormorant Garamond (400/500/600) — titoli, nomi prodotto, prezzi. `letter-spacing: 0.14em`, `text-transform: uppercase` per gli occhielli; titoli grandi in minuscolo con capolettera.
- **Body**: Jost (300/400/500) — paragrafi, UI, label. `line-height: 1.8`, `letter-spacing: 0.02em`.
- Occhielli (eyebrow): Jost 300, 11px, uppercase, `letter-spacing: 0.32em`, colore muted.
- Scale: hero 72–104px, h2 40–56px, h3 22–28px, body 16–17px.

## Layout & Componenti

- Contenuto centrato max-width 1240px; sezioni con padding verticale 96–140px.
- Griglia catalogo: 2 col mobile / 3 col tablet / 4 col desktop, gap 40px, immagini 4:5, nessun bordo — solo nome, categoria, prezzo sotto la foto, centrati.
- Filetto ornamentale (linea 1px + rombo centrale) sotto i titoli di sezione.
- Bottoni: rettangolari, senza radius (2px), bordo 1px ink, uppercase Jost 12px `letter-spacing .2em`; fill ink su hover.
- Header: sticky, trasparente sopra l'hero, fondo avorio con hairline dopo lo scroll; logo centrato su desktop, nav a due lati.
- Motion: reveal in fade+translate all'ingresso in viewport (staggered), zoom lento 1.0→1.05 sulle foto in hover. CSS/Motion, mai animazioni gratuite.

## Pagine

- **Home** (`pages/index.tsx`) — hero cipria, 4 mondi (Bomboniere/Partecipazioni/Confettate/Allestimenti), selezione dal catalogo, blocco wedding planner, contatti brevi.
- **Catalogo** (`pages/catalogo.tsx`) — ricerca, filtro per categoria e sottocategoria, ordinamento, paginazione. Server-side.
- **Prodotto** (`pages/prodotto.tsx`) — galleria, descrizione, SKU, prezzo (se attivo), CTA "Richiedi informazioni", correlati.
- **Chi siamo** (`pages/chi-siamo.tsx`) — storia dal 1999, punti di forza.
- **Allestimenti** (`pages/allestimenti.tsx`) — portfolio per tipo di evento + richiesta preventivo.
- **Wedding planner** (`pages/wedding-planner.tsx`) — servizio, percorso in step, CTA.
- **Contatti** (`pages/contatti.tsx`) — dati, mappa, orari, form.
- **Admin** (`pages/admin.tsx`) — accesso con password: interruttore visibilità prezzi, numero WhatsApp/email, elenco richieste ricevute.

## Flussi

1. Utente sfoglia il catalogo → apre un prodotto → "Richiedi informazioni" → form breve (nome, evento, data, quantità, note) → la richiesta viene salvata e si apre WhatsApp con il messaggio già compilato.
2. Il titolare apre `/admin`, inserisce la password, e con un interruttore mostra o nasconde tutti i prezzi del sito senza toccare il codice.

## Architettura

- Catalogo su SQLite/Turso via Drizzle: `categories`, `products`, `product_images`, `inquiries`, `settings`. Seed da `src/api/database/catalog-data.json` (esportato dal WooCommerce esistente).
- Immagini prodotto scaricate e convertite in WebP in `packages/web/public/images/catalogo/` — il sito non dipende dal vecchio WordPress.
- API oRPC in `src/api/routes/` (`catalog`, `inquiries`, `settings`), hook in `src/web/queries/`.

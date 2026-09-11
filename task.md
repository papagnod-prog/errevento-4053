# Errevento — restyling senza ecommerce

## Stato: sito + back-office completi e verificati

### Fatto
- Scraping: 755 prodotti + 20 categorie + 1013 immagini (WebP) dal sito attuale.
- DB (SQLite/Drizzle): categories, products, productCategories, productImages, inquiries, settings. `db:push` + `db:seed` ok.
- API oRPC: catalog (categorie, lista con filtri/ricerca/sort/paginazione, featured, prodotto, preview categorie), inquiries (create → whatsappUrl), settings (get/login/update/inquiries/deleteInquiry).
- Pagine: home, catalogo, prodotto, chi-siamo, allestimenti, wedding-planner, contatti, admin, 404.
- Route registrate in `app.tsx` dentro `<Layout>`; RunableBadge e AgentFeedback intatti.
- ~~`ADMIN_PASSWORD`~~ rimosso: l'admin ora usa utenti veri (Better Auth).
- `bun run build` → 2 tasks successful, nessun errore.
- Verifica browser: home, catalogo (755 articoli, filtri, immagini), scheda prodotto, allestimenti, wedding-planner, contatti, admin login + toggle prezzi (→ "Su richiesta"), form richiesta (whatsappUrl generato). Mobile 390px ok.
- Fix: nav "Wedding Planner" su una riga; opacità hero 25 → 40.

### Fase 2 — back-office (fatto)
- Better Auth 1.6.19 solo email/password, plugin `bearer()`; token in `localStorage` (`errevento_admin_token`) così funziona anche nell'iframe di anteprima.
- Registrazione pubblica chiusa: gate `api/lib/user-gate.ts` + hook `user.create.before`. Utenti creati solo da `adminUsers.setup` (primo accesso, DB vuoto) o `adminUsers.create` (autenticato).
- Schede admin: Prodotti (CRUD, ricerca, filtro categoria, ordinamento, paginazione, evidenza, elimina con conferma), Categorie (albero, CRUD), Richieste, Impostazioni (prezzi on/off, WhatsApp, email), Utenti (crea, cambia password, elimina con conferma).
- Upload immagini → Tigris/S3 con presigned PUT; URL salvato come `/api/media/<key>`, servito con redirect 302 firmato (1h). Verificato 302 + immagine visibile.
- `refreshCategoryCounts` corretto: conteggio distinto sul sottoalbero (prima "Bomboniere" mostrava 1490 > 755). Ora Confettate 371, Bomboniere 365. Il seed richiama la stessa funzione.
- Verifica browser: login/sessione, creazione prodotto con upload, modifica prezzo (9,90 → 12,50), eliminazione (756 → 755), categorie, richieste, impostazioni, creazione + eliminazione secondo utente. Mobile 390px ok. `typecheck` e `build` ok.

### Fase 3 — agente WhatsApp (da fare)
- Obiettivo: creare / modificare / eliminare prodotti, toggle "in evidenza", notifica richieste dal sito, inviando foto + testo su WhatsApp.
- Cloud API di Meta, webhook `POST /api/whatsapp`, allowlist numeri, media scaricati dalla Media API e caricati sullo stesso bucket, parsing testo con LLM, conferma esplicita prima di scrivere sul DB.
- Serve: Meta Business verificato + numero dedicato (anche estero) e sito pubblicato con URL stabile.

### Note / da chiedere al cliente
- Logo, numero cellulare ed email definitivi (ora dal sito attuale: +39 339 129 9927, info@errevento.it).
- `bun run lint` segnala 1 errore preesistente del template in `packages/mobile/app/_layout.tsx` (import ErrorBoundary vs __ErrorBoundary): non riguarda il sito, package mobile mai toccato.
- og-image.png è ancora quella del template: sostituire con un'immagine Errevento.

## Fase SEO / preparazione switch dominio (16/08/2026)
- Pagine legali: `src/web/pages/privacy.tsx`, `src/web/pages/cookie-policy.tsx` + `src/web/components/legal-layout.tsx`.
  Rotte mantenute uguali al vecchio sito: `/privacy-policy`, `/cookie-policy`. Link nel footer.
  Testi adattati dal vecchio sito (rimossi riferimenti a ecommerce/carrello/account, aggiunti form richieste + WhatsApp).
- Redirect legacy lato client (`__server.ts` è template-managed, no 301 reali):
  `src/web/lib/legacy-redirects.ts` (mappa 187/201 tag -> /catalogo?q=..., i restanti -> /catalogo)
  `src/web/components/legacy-redirect.tsx` (catch-all: normalizza slash finale, redirect, 404 con meta noindex)
  Regole: /product/:slug -> /prodotto/:slug (755 slug verificati, 0 mancanti), /product-category/**/:last -> /catalogo?categoria=:last,
  /product-tag/:slug -> ricerca, cart/checkout/my-account/wishlist/shop/... -> /catalogo, blog e /tag/*,/category/* -> /,
  pagine demo del tema -> 404.
- `useCanonicalUrl` in `components/layout.tsx`: rimuove slash finale via replaceState e aggiorna `link[rel=canonical]`.
- `public/sitemap.xml` (783 URL, generata con /home/user/tools/sitemap.ts) e `public/robots.txt` (Disallow /admin, /api/).
- Verificato: typecheck 3/3, build 2/2, browser -> /product/albero-della-vita-in-legno/ -> prodotto ok,
  /product-category/confettate/matrimonio -> categoria, /product-tag/18-anni -> 24 articoli, /cart -> catalogo,
  /un-po-di-voi -> home, /catalogo/ -> /catalogo, pagine legali ok anche a 390px.
- Prossimo: switch DNS su Aruba (solo l'utente), poi verifica dominio + invio sitemap in Search Console.

## Fase SEO / preparazione switch dominio (16/08/2026) — COMPLETATA
- `lib/legacy-redirects.ts` + `components/legacy-redirect.tsx`: redirect client-side dai 1096 URL WordPress
  (`/product/*` → `/prodotto/*`, `/product-category/*` → `/catalogo?categoria=`, `/product-tag/*` → `/catalogo?q=` via mappa
  verificata sul DB, cart/checkout/account/shop/wishlist → `/catalogo`, blog → `/`, demo tema → 404 noindex).
  Normalizzazione dello slash finale inclusa.
- Pagine legali: `pages/privacy.tsx`, `pages/cookie-policy.tsx` (+ `components/legal-layout.tsx`), rotte `/privacy-policy`
  e `/cookie-policy`, link nel footer. Testo ripreso dal vecchio sito e ripulito da ecommerce/pagamenti/account.
- `public/sitemap.xml` (783 URL) e `public/robots.txt` (Disallow /admin, /api/).
- Verificato: typecheck 3/3, build 2/2, redirect testati in browser, mobile 390px ok.
- Manca solo lo switch DNS su Aruba (record A apex + www) — lo esegue l'utente.

## Brand (17/08/2026)
- Rimosso `<RunableBadge />` e il suo import da `src/web/app.tsx` (su richiesta del cliente).
- Logo ufficiale in `public/images/site/logo-errevento.png`, usato nell'header al posto del wordmark testuale (h-14 mobile / h-[74px] desktop).
- `favicon.ico` (16/32/48/64) e `apple-touch-icon.png` generati dal fiore di loto del logo su fondo avorio; `<link rel="apple-touch-icon">` aggiunto in index.html.
- `og-image.png` sostituita: foto confetti sfocata + velo avorio + logo centrato (1200x630).
- Contatti confermati dal cliente: telefono +39 339 129 9927, email info@errevento.it (già presenti in lib/site.ts).

## Fase 3 — Agente WhatsApp (17/08/2026) — CODICE COMPLETO E TESTATO IN LOCALE
File nuovi:
- `src/api/lib/whatsapp.ts` — client Meta Cloud API v23.0: `whatsappConfigured`, `adminNumbers`, `isAdminNumber`,
  `sendText` (non solleva mai), `saveIncomingMedia` (Media API → Tigris → `/api/media/<key>`), `parseWebhook`.
- `src/api/agent/gateway.ts`, `format.ts`, `proposals.ts`, `tools.ts`, `catalog-agent.ts`, `whatsapp-handler.ts`.
- Schema: tabelle `whatsapp_sessions` (phone PK, history, pending, images, updatedAt) e `whatsapp_events` (dedupe webhook).
  Create con `bun run db:push`.

Rotte registrate in `src/api/index.ts` (HTTP, non oRPC):
- `GET /api/whatsapp` → verifica webhook Meta: confronta `hub.verify_token` con `WHATSAPP_VERIFY_TOKEN`,
  risponde `hub.challenge` in text/plain 200, altrimenti 403.
- `POST /api/whatsapp` → `parseWebhook()` + `handleWhatsappMessage()` in background, risponde subito `EVENT_RECEIVED` 200
  (Meta ritenta dopo ~20s).
`src/api/routes/inquiries.ts`: `notifyInquiry()` agganciato alla creazione richiesta, in `void ... .catch()`
così un invio WhatsApp fallito non fa fallire la richiesta dal sito.

Sicurezza / comportamento:
- Allowlist `WHATSAPP_ADMIN_NUMBERS`: numeri non autorizzati ignorati in silenzio (solo console.warn), nessun costo di invio.
- Nessuna scrittura diretta: i tool `proponi*` salvano una proposta in `whatsapp_sessions.pending`;
  si applica solo dopo conferma (`sì/ok/confermo/procedi/👍…`), `no/annulla/stop` la scarta.
- Dedupe dei webhook via `whatsapp_events` (id messaggio come PK).

Test eseguiti in locale (porta 4200):
- verifica webhook con token corretto → `CHAL123` 200; token sbagliato → 403.
- POST da numero non in allowlist → ignorato ("messaggio ignorato da numero non autorizzato").
- domanda al catalogo ("quanti articoli in confettate?") → risposta corretta 371.
- creazione articolo → proposta + riepilogo, "sì" → prodotto id 11789 scritto in DB.
- "no, aspetta" su eliminazione → annullata, prodotto intatto; poi "confermo" → eliminato.
- stesso messageId inviato due volte → elaborato una sola volta.
- Sessioni/eventi/prodotto di test ripuliti dal DB.

Bug trovati e corretti durante il test:
- `YES`/`NO`: `\b` dopo lettera accentata non combacia in JS → "sì" non veniva riconosciuto.
  Aggiunta `normalizeAnswer()` (NFD + rimozione diacritici + punteggiatura finale).
- Se arrivava solo una foto mentre c'era una proposta in sospeso, la proposta veniva scartata senza salvare:
  ora si scarta solo se c'è testo.
- Link prodotto nel messaggio di conferma usava `WEBSITE_URL` (dominio preview + doppio slash):
  ora `siteUrl()` → `SITE_URL` o default `https://errevento.it`.

Credenziali (17/08/2026): tutte e cinque le var `WHATSAPP_*` sono nel `.env` root.
`WHATSAPP_PHONE_NUMBER_ID=1241799622354739`, `WHATSAPP_BUSINESS_ACCOUNT_ID=2929114310754614`,
`WHATSAPP_ADMIN_NUMBERS=393391299927`, `WHATSAPP_VERIFY_TOKEN=27e9ea7dd978dcbe88c72da0a4ac2feb`.
Il token è stato validato su Graph API: `display_phone_number "+1 555-203-7245"`, `verified_name "Test Number"`.
Il primo token fornito era scaduto (15/08 12:00 PDT) — quelli del numero di test durano 24h.

Test con credenziali reali (17/08/2026, porta 4200, webhook simulato):
- domanda catalogo → "Bomboniere 365" e sottocategorie corrette; ricerca → "Porta Stuzzicadenti, C1B1470014, 4,00 €".
- prezzo a 4,50 + "no" → annullato, DB invariato (4).
- prezzo a 4,50 + "sì" → DB 4.5; "rimetti a 4,00" + "confermo" → DB 4. Ciclo di scrittura verificato.
- numero non in allowlist → ignorato in silenzio.
- invio reale a 393391299927 → Meta 131030 "Recipient phone number not in allowed list":
  quel numero non è tra i destinatari di test registrati.
- COLLAUDO: `WHATSAPP_ADMIN_NUMBERS=393381464613` (numero dello sviluppatore, registrato in Meta).
  DA RIPRISTINARE a `393391299927` (Rossella) prima della consegna.
- invio reale a 393381464613 → template `hello_world` `message_status: accepted`;
  risposta dell'agente inviata senza errori (log pulito). Catena completa OK.
- Nota: dopo una modifica al `.env` va riavviato il dev server, Vite legge le env solo all'avvio.
- Aggiunto `console.error` in `sendText()`: prima gli errori di invio erano silenziosi.
- Sessioni ed eventi di test ripuliti dal DB.

Da fare (richiede l'utente):
1. Meta → WhatsApp → Configuration: Callback URL `https://errevento.it/api/whatsapp`, Verify Token come sopra,
   sottoscrivere il campo `messages`.
2. Registrare il cellulare tra i destinatari di test ("Gestisci elenco numeri di telefono") e confermare il codice.
3. Redeploy dal pannello Runable (le modifiche brand + questa fase non sono ancora online).
4. Produzione: numero dedicato reale + Meta Business verificato + token permanente da System User;
   rigenerare il token attuale dopo il collaudo (è transitato in uno screenshot).

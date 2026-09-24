import { LegalPage, type LegalBlock } from "../components/legal-layout";
import { SITE } from "../lib/site";

const BLOCKS: LegalBlock[] = [
  {
    type: "p",
    text: "Questo documento contiene informazioni in merito alle tecnologie che consentono a questo sito di raggiungere gli scopi descritti di seguito. Tali tecnologie permettono al Titolare di raccogliere e salvare informazioni (per esempio tramite l'utilizzo di cookie) o di utilizzare risorse (per esempio eseguendo uno script) sul dispositivo dell'utente quando quest'ultimo interagisce con il sito.",
  },
  {
    type: "p",
    text: "Per semplicità, in questo documento tali tecnologie sono sinteticamente definite “strumenti di tracciamento”, salvo vi sia ragione di differenziare. Il termine cookie è utilizzato solo per indicare in modo specifico quel particolare tipo di strumento di tracciamento, che richiede la presenza di un browser.",
  },
  {
    type: "p",
    text: "In sintesi, e come spiegato in dettaglio nei paragrafi che seguono: le pagine pubbliche di questo sito non installano alcun cookie, né di prima né di terza parte, e non impiegano strumenti di tracciamento che richiedano il consenso dell'utente. Per questo motivo non viene mostrato alcun banner di consenso: non vi è alcun consenso da raccogliere.",
  },
  {
    type: "p",
    text: "Alcune delle finalità per le quali vengono impiegati strumenti di tracciamento potrebbero richiedere il consenso dell'utente. Se viene prestato il consenso, esso può essere revocato liberamente in qualsiasi momento seguendo le istruzioni contenute in questo documento.",
  },

  {
    type: "h2",
    text: "Attività strettamente necessarie al funzionamento del sito",
  },
  {
    type: "p",
    text: "Le pagine pubbliche di questo sito — home, catalogo, schede prodotto, pagine informative e di contatto — non installano alcun cookie. Le preferenze di navigazione e i filtri del catalogo sono gestiti nella memoria del browser per la durata della visita, senza cookie e senza identificativi persistenti. Un unico cookie tecnico di sessione viene impostato esclusivamente nell'area riservata al personale del negozio (percorso /admin), al momento dell'accesso con le credenziali: è necessario al funzionamento dell'autenticazione, non raggiunge i visitatori del sito e per esso non è richiesto il consenso.",
  },

  { type: "h3", text: "Misurazione delle visite senza cookie" },
  {
    type: "p",
    text: "Per conoscere il numero di visite ricevute dalle pagine del catalogo, il Titolare utilizza un conteggio realizzato senza cookie e senza strumenti di tracciamento sul dispositivo dell'utente. Al momento della visita, indirizzo IP e tipo di browser vengono trasformati in un codice cifrato non reversibile, valido per la sola giornata in corso: il codice non permette di risalire alla persona, non viene incrociato con altri dati e non consente di riconoscere l'utente in visite successive. Non vengono conservati né l'indirizzo IP né altri dati identificativi, e la rilevazione non riguarda le richieste provenienti da motori di ricerca e altri sistemi automatici.",
  },

  { type: "h2", text: "Contenuti e servizi di terze parti" },
  { type: "h3", text: "Font di carattere (serviti da questo sito)" },
  {
    type: "p",
    text: "I caratteri tipografici utilizzati dalle pagine (Cormorant Garamond e Jost, distribuiti con licenza SIL Open Font License) sono ospitati direttamente sui server di questo sito e vengono caricati dal dominio errevento.it. Il browser dell'utente non contatta i server di Google Fonts né di altri fornitori esterni, e nessun dato — indirizzo IP compreso — viene per questo motivo trasmesso a terzi.",
  },
  { type: "h3", text: "Google Maps (Google Ireland Limited) — caricamento su richiesta" },
  {
    type: "p",
    text: "La pagina Contatti mostra la posizione del negozio tramite una mappa di Google Maps che non viene caricata automaticamente. Al suo posto è presente un riquadro con l'indirizzo e un pulsante: la mappa, e con essa il collegamento ai server di Google, si attiva soltanto se l'utente la richiede espressamente. Finché ciò non avviene, nessun dato viene trasmesso a Google. Se l'utente decide di caricare la mappa, o di seguire il link che apre Google Maps in una nuova finestra, il servizio può raccogliere dati di utilizzo e installare cookie propri, secondo le condizioni di Google. Luogo del trattamento: Irlanda e Stati Uniti. Informativa: https://policies.google.com/privacy",
  },
  {
    type: "h3",
    text: "Cloudflare Turnstile (Cloudflare, Inc.) — caricamento all'apertura del modulo",
  },
  {
    type: "p",
    text: "Il modulo di richiesta informazioni è protetto da Cloudflare Turnstile, un controllo antiabuso che serve a distinguere le richieste inviate da una persona da quelle inviate da programmi automatici. Il controllo non viene caricato insieme alle pagine: il browser contatta i server di Cloudflare soltanto nel momento in cui l'utente apre il modulo. Per eseguire la verifica, Cloudflare può depositare sul dispositivo un identificativo tecnico di breve durata e trattare l'indirizzo IP e informazioni tecniche su browser e dispositivo. Si tratta di uno strumento strettamente necessario a proteggere un servizio richiesto dall'utente, utilizzato per questa sola finalità e non per profilazione o pubblicità: per questo non è subordinato al consenso. Se l'utente non apre il modulo, nessun dato viene trasmesso a Cloudflare. Luogo del trattamento: Stati Uniti e Unione Europea. Informativa: https://www.cloudflare.com/privacypolicy/",
  },
  {
    type: "p",
    text: "Questo sito non utilizza strumenti di tracciamento per finalità di profilazione pubblicitaria, remarketing o statistiche di terze parti, non integra pulsanti social né widget di piattaforme esterne, e non consente l'acquisto online: non impiega quindi cookie legati a carrello, pagamenti o account cliente.",
  },

  { type: "h2", text: "Come gestire le preferenze e revocare il consenso" },
  {
    type: "p",
    text: "Poiché questo sito non impiega strumenti di tracciamento subordinati al consenso, non è previsto alcun pannello delle preferenze da impostare o revocare. L'unico caso in cui l'utente sceglie è il caricamento della mappa nella pagina Contatti, che avviene solo su sua richiesta ed è limitato alla singola visualizzazione. Resta comunque possibile agire direttamente sulle impostazioni del proprio browser.",
  },
  { type: "h3", text: "Impostazioni relative agli strumenti di tracciamento" },
  {
    type: "p",
    text: "Gli utenti possono gestire le preferenze relative ai cookie all'interno del proprio browser e, per esempio, impedirne l'utilizzo da parte di terze parti oppure eliminare quelli già installati. È importante notare che disabilitando tutti i cookie il funzionamento di questo sito potrebbe risultare compromesso. Le istruzioni per la gestione dei cookie sono disponibili nelle pagine di supporto dei principali browser:",
  },
  {
    type: "ul",
    items: [
      "Google Chrome — Impostazioni › Privacy e sicurezza › Cookie e altri dati dei siti",
      "Mozilla Firefox — Impostazioni › Privacy e sicurezza › Cookie e dati dei siti web",
      "Apple Safari — Preferenze › Privacy",
      "Microsoft Edge — Impostazioni › Cookie e autorizzazioni sito",
    ],
  },
  {
    type: "p",
    text: "Per quanto riguarda gli strumenti di tracciamento di terze parti, gli utenti possono gestire le proprie preferenze visitando il relativo link di opt-out, ove disponibile, oppure contattando direttamente il terzo. Fermo restando quanto precede, gli utenti possono avvalersi delle informazioni fornite da EDAA per l'Unione Europea, NAI negli Stati Uniti e DAAC in Canada.",
  },

  { type: "h2", text: "Titolare del trattamento dei dati" },
  {
    type: "p",
    text: `${SITE.legalName} — ${SITE.address}, ${SITE.city} — P.IVA ${SITE.vat}. Indirizzo email del Titolare: ${SITE.email}`,
  },
  {
    type: "p",
    text: "Dal momento che l'installazione di strumenti di tracciamento di terza parte e di altri sistemi di tracciamento tramite i servizi utilizzati da questo sito non può essere tecnicamente controllata dal Titolare, ogni riferimento specifico a tali strumenti è da considerarsi indicativo. Per ottenere informazioni complete, l'utente è invitato a consultare la privacy policy degli eventuali servizi terzi elencati in questo documento.",
  },
  {
    type: "p",
    text: "Data l'oggettiva complessità di identificazione delle tecnologie di tracciamento, gli utenti sono invitati a contattare il Titolare qualora volessero ricevere ulteriori informazioni in merito all'utilizzo di tali tecnologie su questo sito.",
  },

  { type: "h2", text: "Definizioni e riferimenti legali" },
  { type: "h3", text: "Dati personali (o dati)" },
  {
    type: "p",
    text: "Costituisce dato personale qualunque informazione che, direttamente o indirettamente, anche in collegamento con qualsiasi altra informazione, renda identificata o identificabile una persona fisica.",
  },
  { type: "h3", text: "Dati di utilizzo" },
  {
    type: "p",
    text: "Sono le informazioni raccolte automaticamente attraverso questo sito, tra cui gli indirizzi IP o i nomi a dominio dei dispositivi utilizzati, gli orari di richiesta, il metodo utilizzato e altri parametri relativi al sistema operativo e all'ambiente informatico dell'utente.",
  },
  { type: "h3", text: "Utente e interessato" },
  {
    type: "p",
    text: "L'utente è l'individuo che utilizza questo sito e che, salvo ove diversamente specificato, coincide con l'interessato, ossia la persona fisica cui si riferiscono i dati personali.",
  },
  { type: "h3", text: "Cookie e strumenti di tracciamento" },
  {
    type: "p",
    text: "I cookie sono strumenti di tracciamento che consistono in piccole porzioni di dati conservate all'interno del browser dell'utente. Per strumento di tracciamento si intende qualsiasi tecnologia — cookie, identificativi univoci, web beacon, script integrati, e-tag e fingerprinting — che consenta di tracciare gli utenti.",
  },
  { type: "h3", text: "Riferimenti legali" },
  {
    type: "p",
    text: "La presente informativa è redatta in adempimento degli obblighi previsti dall'art. 5, paragrafo 3, della Direttiva 2002/58/CE e dal Regolamento (UE) 2016/679, nonché in conformità alle Linee guida del Garante per la protezione dei dati personali in materia di cookie e altri strumenti di tracciamento.",
  },
  {
    type: "p",
    text: "Questa informativa riguarda esclusivamente questo sito, se non diversamente specificato all'interno del documento.",
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      eyebrow="Informativa"
      title="Cookie Policy"
      updated="24 settembre 2026"
      blocks={BLOCKS}
    />
  );
}

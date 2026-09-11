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
    text: "Alcune delle finalità per le quali vengono impiegati strumenti di tracciamento potrebbero richiedere il consenso dell'utente. Se viene prestato il consenso, esso può essere revocato liberamente in qualsiasi momento seguendo le istruzioni contenute in questo documento.",
  },
  {
    type: "p",
    text: "Questo sito utilizza strumenti di tracciamento gestiti direttamente dal Titolare (di “prima parte”) e strumenti di tracciamento che abilitano servizi forniti da terzi (di “terza parte”). La durata e la scadenza dei cookie possono variare a seconda di quanto impostato dal Titolare o da ciascun fornitore terzo; alcuni di essi scadono al termine della sessione di navigazione.",
  },

  {
    type: "h2",
    text: "Attività strettamente necessarie al funzionamento del sito",
  },
  {
    type: "p",
    text: "Questo sito utilizza cookie comunemente detti “tecnici” o altri strumenti di tracciamento analoghi per svolgere attività strettamente necessarie a garantire il funzionamento del servizio. Fra questi: la memorizzazione delle preferenze di navigazione e dei filtri del catalogo, la gestione della sessione di accesso all'area riservata al personale del negozio e le misure di sicurezza di base. Per questi strumenti non è richiesto il consenso dell'utente.",
  },

  { type: "h2", text: "Altre attività che prevedono strumenti di tracciamento" },
  { type: "h3", text: "Miglioramento dell'esperienza" },
  {
    type: "p",
    text: "Questo sito utilizza strumenti di tracciamento per fornire una user experience personalizzata, consentendo una migliore gestione delle impostazioni e l'interazione con reti e piattaforme esterne.",
  },
  { type: "h3", text: "Visualizzazione di contenuti da piattaforme esterne" },
  {
    type: "p",
    text: "Questo tipo di servizi permette di visualizzare contenuti ospitati su piattaforme esterne direttamente dalle pagine di questo sito, come mappe e font. Tali servizi potrebbero raccogliere dati sul traffico web relativi alle pagine in cui il servizio è installato, anche quando gli utenti non li utilizzano.",
  },
  { type: "h3", text: "Google Fonts (Google Ireland Limited)" },
  {
    type: "p",
    text: "Google Fonts è un servizio di visualizzazione di stili di carattere. I font utilizzati da questo sito sono serviti localmente ove tecnicamente possibile; qualora vengano richiamati dai server di Google, il servizio raccoglie dati di utilizzo e strumenti di tracciamento. Luogo del trattamento: Irlanda e Stati Uniti.",
  },
  { type: "h3", text: "Google Maps (Google Ireland Limited)" },
  {
    type: "p",
    text: "Le pagine di contatto possono contenere link o riquadri verso Google Maps per indicare la posizione del negozio. L'apertura della mappa può comportare l'installazione di cookie da parte di Google. Luogo del trattamento: Irlanda e Stati Uniti.",
  },
  {
    type: "p",
    text: "Questo sito non utilizza strumenti di tracciamento per finalità di profilazione pubblicitaria o remarketing e non consente l'acquisto online, quindi non impiega cookie legati a carrello, pagamenti o account cliente.",
  },

  { type: "h2", text: "Come gestire le preferenze e revocare il consenso" },
  {
    type: "p",
    text: "Ove l'utilizzo di strumenti di tracciamento sia basato sul consenso, l'utente può fornire o revocare tale consenso impostando o aggiornando le proprie preferenze tramite il relativo pannello, se disponibile, oppure agendo direttamente sulle impostazioni del proprio browser.",
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
      updated="16 agosto 2026"
      blocks={BLOCKS}
    />
  );
}

import { LegalPage, type LegalBlock } from "../components/legal-layout";
import { SITE } from "../lib/site";

const BLOCKS: LegalBlock[] = [
  {
    type: "p",
    text: "Questo sito raccoglie alcuni dati personali dei propri utenti. Il presente documento può essere stampato utilizzando il comando di stampa presente nelle impostazioni di qualsiasi browser.",
  },

  { type: "h2", text: "Titolare del trattamento dei dati" },
  {
    type: "p",
    text: `${SITE.legalName} — ${SITE.address}, ${SITE.city} — P.IVA ${SITE.vat}.`,
  },
  { type: "p", text: `Indirizzo email del Titolare: ${SITE.email}` },

  { type: "h2", text: "Tipologie di dati raccolti" },
  {
    type: "p",
    text: "Fra i dati personali raccolti da questo sito, in modo autonomo o tramite terze parti, ci sono: nome e cognome, numero di telefono, indirizzo email, contenuto del messaggio inviato tramite il modulo di richiesta informazioni, dati di utilizzo e strumenti di tracciamento tecnici.",
  },
  {
    type: "p",
    text: "Questo sito è un catalogo consultabile: non consente l'acquisto online, non gestisce carrelli, ordini o pagamenti e non richiede la creazione di un account da parte degli utenti. Non vengono quindi raccolti dati di fatturazione, di spedizione o strumenti di pagamento.",
  },
  {
    type: "p",
    text: "I dati personali possono essere liberamente forniti dall'utente o, nel caso dei dati di utilizzo, raccolti automaticamente durante l'uso del sito. Se non diversamente specificato, tutti i dati richiesti dal sito sono obbligatori: se l'utente rifiuta di comunicarli potrebbe essere impossibile dar seguito alla richiesta. Nei casi in cui alcuni dati siano indicati come facoltativi, gli utenti sono liberi di non comunicarli senza alcuna conseguenza.",
  },
  {
    type: "p",
    text: "L'utente si assume la responsabilità dei dati personali di terzi ottenuti, pubblicati o condivisi mediante questo sito e garantisce di avere il diritto di comunicarli, liberando il Titolare da qualsiasi responsabilità verso terzi.",
  },

  { type: "h2", text: "Modalità e luogo del trattamento" },
  { type: "h3", text: "Modalità di trattamento" },
  {
    type: "p",
    text: "Il Titolare adotta le opportune misure di sicurezza volte ad impedire l'accesso, la divulgazione, la modifica o la distruzione non autorizzate dei dati personali. Il trattamento viene effettuato mediante strumenti informatici e telematici, con modalità organizzative e logiche strettamente correlate alle finalità indicate. Oltre al Titolare, in alcuni casi possono avere accesso ai dati altri soggetti coinvolti nell'organizzazione del sito (personale amministrativo e commerciale) oppure soggetti esterni (fornitori di servizi tecnici, hosting provider, società informatiche), nominati se necessario Responsabili del trattamento. L'elenco aggiornato dei Responsabili può sempre essere richiesto al Titolare.",
  },
  { type: "h3", text: "Base giuridica del trattamento" },
  {
    type: "p",
    text: "Il Titolare tratta i dati personali dell'utente qualora sussista una delle seguenti condizioni:",
  },
  {
    type: "ul",
    items: [
      "l'utente ha prestato il consenso per una o più finalità specifiche;",
      "il trattamento è necessario all'esecuzione di misure precontrattuali richieste dall'utente, come la risposta a una richiesta di informazioni o di preventivo;",
      "il trattamento è necessario per adempiere un obbligo legale al quale è soggetto il Titolare;",
      "il trattamento è necessario per il perseguimento del legittimo interesse del Titolare o di terzi, ad esempio garantire la sicurezza del sito.",
    ],
  },
  { type: "h3", text: "Luogo" },
  {
    type: "p",
    text: "I dati sono trattati presso le sedi operative del Titolare e in ogni altro luogo in cui siano localizzate le parti coinvolte nel trattamento. A seconda della posizione dell'utente, i trasferimenti di dati possono comportare il trasferimento verso un Paese diverso dal proprio: per ulteriori informazioni sul luogo del trattamento l'utente può contattare il Titolare agli estremi indicati sopra.",
  },
  { type: "h3", text: "Periodo di conservazione" },
  {
    type: "p",
    text: "Se non diversamente indicato, i dati personali sono trattati e conservati per il tempo richiesto dalla finalità per la quale sono stati raccolti. Le richieste di informazioni inviate tramite il modulo del sito sono conservate per il tempo necessario a gestire la richiesta e la successiva relazione commerciale, e in ogni caso non oltre 24 mesi dall'ultimo contatto, salvo obblighi di legge o necessità di difesa in giudizio. I dati trattati sulla base del consenso sono conservati fino alla revoca dello stesso. Al termine del periodo di conservazione i dati sono cancellati: pertanto i diritti di accesso, cancellazione, rettifica e portabilità non potranno più essere esercitati.",
  },

  { type: "h2", text: "Finalità del trattamento" },
  {
    type: "p",
    text: "I dati dell'utente sono raccolti per consentire al Titolare di rispondere alle richieste di informazioni e preventivo, gestire i contatti tramite telefono, email e WhatsApp, fornire il servizio di consultazione del catalogo, garantire la sicurezza e la manutenzione del sito e adempiere agli obblighi di legge.",
  },

  { type: "h2", text: "Dettagli sul trattamento dei dati personali" },
  { type: "h3", text: "Modulo di richiesta informazioni" },
  {
    type: "p",
    text: "Compilando il modulo presente sulle pagine di prodotto e nella pagina Contatti, l'utente trasmette al Titolare i dati necessari a ricevere una risposta: nome, contatto telefonico o email e, se indicati, tipo di evento, data, quantità e messaggio. I dati sono salvati nel database del sito e resi disponibili al solo personale del Titolare. La base giuridica del trattamento è l'esecuzione di misure precontrattuali adottate su richiesta dell'interessato (art. 6, par. 1, lett. b del Regolamento): per rispondere a una richiesta di informazioni, di preventivo o di appuntamento non è quindi necessario alcun consenso, e non ne viene richiesto alcuno. Il solo campo obbligatorio è il nome; gli altri dati sono facoltativi e la loro mancanza comporta unicamente la difficoltà di ricontattare l'utente. Le richieste sono conservate per il tempo necessario a gestire la trattativa e i conseguenti obblighi amministrativi, e possono essere cancellate su richiesta dell'interessato.",
  },
  { type: "h3", text: "Contatto tramite WhatsApp" },
  {
    type: "p",
    text: "Il sito mette a disposizione pulsanti che aprono una conversazione WhatsApp con un messaggio precompilato. Avviando la conversazione, il trattamento dei dati di messaggistica è regolato anche dall'informativa privacy di WhatsApp Ireland Limited, di cui l'utente è invitato a prendere visione. Il Titolare tratta i messaggi ricevuti al solo fine di rispondere alla richiesta.",
  },
  { type: "h3", text: "Misurazione delle visite senza cookie" },
  {
    type: "p",
    text: "Il Titolare rileva il numero di visite ricevute dalle pagine del catalogo senza installare cookie e senza strumenti di tracciamento sul dispositivo dell'utente. Al momento della visita, indirizzo IP e tipo di browser vengono trasformati in un codice cifrato non reversibile, valido per la sola giornata in corso: il codice non consente di risalire alla persona né di riconoscere l'utente in visite successive, e né l'indirizzo IP né altri dati identificativi vengono conservati. La base giuridica è il legittimo interesse del Titolare a conoscere l'andamento delle visite in forma aggregata (art. 6, par. 1, lett. f del Regolamento).",
  },
  { type: "h3", text: "Font di carattere serviti da questo sito" },
  {
    type: "p",
    text: "I caratteri tipografici utilizzati dalle pagine (Cormorant Garamond e Jost, distribuiti con licenza SIL Open Font License) sono ospitati direttamente sui server di questo sito. Il browser dell'utente non contatta i server di Google Fonts né di altri fornitori esterni: nessun dato, indirizzo IP compreso, viene per questo motivo trasmesso a terzi.",
  },
  { type: "h3", text: "Google Maps (Google Ireland Limited) — caricamento su richiesta" },
  {
    type: "p",
    text: "La pagina Contatti mostra la posizione del negozio tramite una mappa di Google Maps che non viene caricata automaticamente: al suo posto è presente un riquadro con l'indirizzo e un pulsante, e il collegamento ai server di Google si attiva soltanto se l'utente lo richiede espressamente. Finché ciò non avviene, nessun dato viene trasmesso a Google. Se l'utente carica la mappa, o segue il link che apre Google Maps in una nuova finestra, il servizio può raccogliere dati di utilizzo e installare cookie propri. Luogo del trattamento: Irlanda e Stati Uniti. Informativa: https://policies.google.com/privacy",
  },
  { type: "h3", text: "Hosting e infrastruttura" },
  {
    type: "p",
    text: "Il sito e il relativo database sono ospitati presso fornitori terzi di servizi cloud, che agiscono in qualità di Responsabili del trattamento e possono trattare dati di utilizzo e log tecnici per finalità di erogazione del servizio e sicurezza.",
  },

  { type: "h2", text: "Diritti dell'utente" },
  {
    type: "p",
    text: "Gli utenti possono esercitare determinati diritti con riferimento ai dati trattati dal Titolare. In particolare, l'utente ha il diritto di:",
  },
  {
    type: "ul",
    items: [
      "revocare il consenso in ogni momento, ove il trattamento sia basato sul consenso;",
      "opporsi al trattamento dei propri dati quando esso avviene su una base giuridica diversa dal consenso;",
      "accedere ai propri dati e ottenere informazioni sulle finalità del trattamento, sulle categorie di dati e sui destinatari;",
      "verificare e chiedere la rettifica dei dati inesatti o incompleti;",
      "ottenere la limitazione del trattamento nei casi previsti dalla legge;",
      "ottenere la cancellazione dei propri dati personali;",
      "ricevere i propri dati in un formato strutturato e di uso comune o chiederne il trasferimento a un altro titolare;",
      "proporre reclamo all'autorità di controllo competente, in Italia il Garante per la protezione dei dati personali.",
    ],
  },
  { type: "h3", text: "Dettagli sul diritto di opposizione" },
  {
    type: "p",
    text: "Quando i dati personali sono trattati nell'interesse pubblico, nell'esercizio di pubblici poteri o per perseguire un interesse legittimo del Titolare, gli utenti hanno diritto ad opporsi al trattamento per motivi connessi alla loro situazione particolare. Se i dati sono trattati per finalità di marketing diretto, gli utenti possono opporsi in qualsiasi momento e senza fornire alcuna motivazione.",
  },
  { type: "h3", text: "Come esercitare i diritti" },
  {
    type: "p",
    text: `Le richieste possono essere inviate senza formalità al Titolare all'indirizzo ${SITE.email}. Il Titolare risponde entro un mese, salvo proroga nei casi previsti dal Regolamento.`,
  },

  { type: "h2", text: "Cookie policy" },
  {
    type: "p",
    text: "Questo sito utilizza strumenti di tracciamento. Per saperne di più l'utente può consultare la Cookie Policy, raggiungibile dal footer di ogni pagina.",
  },

  { type: "h2", text: "Ulteriori informazioni sul trattamento" },
  { type: "h3", text: "Difesa in giudizio" },
  {
    type: "p",
    text: "I dati personali dell'utente possono essere utilizzati da parte del Titolare in giudizio o nelle fasi preparatorie alla sua eventuale instaurazione, per la difesa da abusi nell'utilizzo di questo sito o dei servizi connessi.",
  },
  { type: "h3", text: "Log di sistema e manutenzione" },
  {
    type: "p",
    text: "Per necessità legate al funzionamento ed alla manutenzione, questo sito e gli eventuali servizi terzi da esso utilizzati potrebbero raccogliere log di sistema, ossia file che registrano le interazioni e che possono contenere dati personali quali l'indirizzo IP.",
  },
  { type: "h3", text: "Informazioni non contenute in questa policy" },
  {
    type: "p",
    text: `Ulteriori informazioni in relazione al trattamento dei dati personali possono essere richieste in qualsiasi momento al Titolare scrivendo a ${SITE.email}.`,
  },
  { type: "h3", text: "Risposta alle richieste “Do Not Track”" },
  {
    type: "p",
    text: "Questo sito non supporta le richieste “Do Not Track”. Per conoscere il comportamento di eventuali servizi terzi utilizzati, l'utente è invitato a consultare le rispettive privacy policy.",
  },
  { type: "h3", text: "Modifiche a questa privacy policy" },
  {
    type: "p",
    text: "Il Titolare si riserva il diritto di apportare modifiche alla presente privacy policy in qualunque momento, dandone informazione agli utenti su questa pagina e, se possibile, su questo sito. Si prega dunque di consultare con frequenza questa pagina, facendo riferimento alla data di ultima modifica indicata in alto.",
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
    text: "Sono le informazioni raccolte automaticamente attraverso questo sito, anche da applicazioni terze parti, tra cui gli indirizzi IP o i nomi a dominio dei dispositivi utilizzati, gli orari di richiesta, il metodo utilizzato, la dimensione del file ottenuto in risposta e altri parametri relativi al sistema operativo e all'ambiente informatico dell'utente.",
  },
  { type: "h3", text: "Utente e interessato" },
  {
    type: "p",
    text: "L'utente è l'individuo che utilizza questo sito e che, salvo ove diversamente specificato, coincide con l'interessato, ossia la persona fisica cui si riferiscono i dati personali.",
  },
  { type: "h3", text: "Responsabile e Titolare del trattamento" },
  {
    type: "p",
    text: "Il Responsabile è il soggetto che tratta dati personali per conto del Titolare. Il Titolare è il soggetto che determina le finalità e i mezzi del trattamento, comprese le misure di sicurezza relative al funzionamento e alla fruizione di questo sito.",
  },
  { type: "h3", text: "Cookie e strumenti di tracciamento" },
  {
    type: "p",
    text: "I cookie sono strumenti di tracciamento che consistono in piccole porzioni di dati conservate all'interno del browser dell'utente. Per strumento di tracciamento si intende qualsiasi tecnologia — cookie, identificativi univoci, web beacon, script integrati, e-tag e fingerprinting — che consenta di tracciare gli utenti.",
  },
  { type: "h3", text: "Riferimenti legali" },
  {
    type: "p",
    text: "La presente informativa privacy è redatta sulla base degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018. Ove non diversamente specificato, questa informativa riguarda esclusivamente questo sito.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Informativa"
      title="Privacy Policy"
      updated="21 settembre 2026"
      blocks={BLOCKS}
    />
  );
}

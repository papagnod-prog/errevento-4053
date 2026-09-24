import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Check, Loader2, X } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useCreateInquiry, useFormToken } from "../queries/inquiries";
import { EVENT_TYPES } from "../lib/site";
import { ActionButton, Field, Ornament, inputClass } from "./ui/bits";
import { Turnstile, captchaEnabled } from "./turnstile";
import { cn } from "../lib/utils";

export type InquirySource = "prodotto" | "allestimenti" | "contatti" | "wedding-planner";

type Props = {
  source: InquirySource;
  productId?: number | null;
  productName?: string;
  defaultEventType?: string;
  compact?: boolean;
  onDone?: () => void;
};

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  eventType: "",
  eventDate: "",
  quantity: "",
  message: "",
  /** Campo trappola: invisibile a chi guarda, riempito solo dai programmi. */
  website: "",
};

/**
 * Messaggio da mostrare quando l'invio non va a buon fine. Le spiegazioni
 * scritte dal server (contatto mancante, numero sbagliato, troppe richieste)
 * arrivano già pronte; tutto il resto diventa un avviso generico.
 */
function errorMessage(error: unknown) {
  const text = error instanceof Error ? error.message.trim() : "";
  const technical = !text || text.length > 200 || /fetch|network|json|orpc|internal/i.test(text);
  return technical
    ? "Invio non riuscito. Riprova o scrivici direttamente su WhatsApp."
    : text;
}

/** Form breve che salva la richiesta e apre WhatsApp con il messaggio già scritto */
export function InquiryForm({
  source,
  productId = null,
  productName,
  defaultEventType,
  compact = false,
  onDone,
}: Props) {
  const [form, setForm] = useState({
    ...emptyForm,
    eventType: defaultEventType ?? "",
  });
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [warning, setWarning] = useState("");
  const create = useCreateInquiry();
  const formToken = useFormToken();

  const hasContact = Boolean(form.phone.trim() || form.email.trim());
  const canSend = Boolean(form.name.trim()) && hasContact && !create.isPending;

  const set = (key: keyof typeof emptyForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setWarning("");
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || create.isPending) return;
    if (!hasContact) {
      setWarning("Lascia un telefono o un'email, altrimenti non possiamo risponderti.");
      return;
    }
    create.mutate(
      {
        ...form,
        productId,
        source,
        formToken: formToken.data?.token ?? "",
        captchaToken,
      },
      {
        onSuccess: (data) => {
          setSentUrl(data.whatsappUrl);
          window.open(data.whatsappUrl, "_blank", "noopener");
          onDone?.();
        },
      },
    );
  };

  if (sentUrl) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blush">
          <Check className="h-5 w-5 text-accent" strokeWidth={1.4} />
        </div>
        <h3 className="mt-5 font-display text-2xl text-ink">Richiesta inviata</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          Si è aperta la conversazione WhatsApp con il messaggio già compilato. Se non
          l'hai vista, apri la chat dal pulsante qui sotto.
        </p>
        <a
          href={sentUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 border border-whatsapp px-7 py-3 text-[11px] uppercase tracking-[0.24em] text-whatsapp transition-colors hover:bg-whatsapp hover:text-white"
        >
          <SiWhatsapp className="h-4 w-4" aria-hidden="true" /> Apri WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative text-left">
      {productName ? (
        <p className="mb-6 border-b border-border pb-4 text-sm text-muted-foreground">
          Richiesta per <span className="text-ink">{productName}</span>
        </p>
      ) : null}

      <div className={cn("grid gap-5", compact ? "sm:grid-cols-2" : "sm:grid-cols-2")}>
        <Field label="Nome e cognome *">
          <input
            required
            value={form.name}
            onChange={set("name")}
            className={inputClass}
            placeholder="Il tuo nome"
          />
        </Field>
        <Field label="Telefono *" hint="Telefono oppure email: almeno uno dei due.">
          <input
            value={form.phone}
            onChange={set("phone")}
            className={inputClass}
            placeholder="339 000 0000"
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
        <Field label="Tipo di evento">
          <select value={form.eventType} onChange={set("eventType")} className={inputClass}>
            <option value="">Seleziona…</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data dell'evento">
          <input
            value={form.eventDate}
            onChange={set("eventDate")}
            className={inputClass}
            placeholder="es. 12 giugno 2027"
          />
        </Field>
        <Field label={source === "prodotto" ? "Quantità indicativa" : "Numero di invitati"}>
          <input
            value={form.quantity}
            onChange={set("quantity")}
            className={inputClass}
            placeholder="es. 80"
          />
        </Field>
        <Field label="Email *">
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            className={inputClass}
            placeholder="nome@email.it"
            autoComplete="email"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Note">
          <textarea
            value={form.message}
            onChange={set("message")}
            rows={compact ? 2 : 3}
            className={cn(inputClass, "resize-none")}
            placeholder="Raccontaci cosa hai in mente…"
          />
        </Field>
      </div>

      {/*
        Campo trappola: fuori dallo schermo e fuori dal percorso di tabulazione,
        nessuna persona lo vede né lo compila. I programmi automatici riempiono
        tutto quello che trovano nel modulo e si tradiscono così.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Sito web
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set("website")}
          />
        </label>
      </div>

      {captchaEnabled ? <Turnstile onToken={setCaptchaToken} /> : null}

      {warning || create.isError ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {warning || errorMessage(create.error)}
        </p>
      ) : null}

      <ActionButton
        type="submit"
        variant="whatsapp"
        disabled={!canSend}
        className="mt-8 w-full"
      >
        {create.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Invio…
          </>
        ) : (
          <>
            <SiWhatsapp className="h-4 w-4" aria-hidden="true" /> Invia su WhatsApp
          </>
        )}
      </ActionButton>
      <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
        Nessun acquisto online: riceverai risposta in chat con disponibilità e tempi.
      </p>
      <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
        Inviando la richiesta dichiari di aver letto l'
        <Link to="/privacy-policy" className="link-underline text-accent">
          Informativa privacy
        </Link>
        . Usiamo i tuoi dati solo per risponderti.
        {captchaEnabled ? " Questo modulo è protetto da Cloudflare Turnstile." : ""}
      </p>
    </form>
  );
}

/** Modale che contiene il form, usata dalla scheda prodotto */
export function InquiryDialog({
  open,
  onClose,
  title = "Richiedi informazioni",
  ...props
}: Props & { open: boolean; onClose: () => void; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-ink/45 px-4 py-8 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Chiudi"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-background px-6 py-10 shadow-2xl sm:px-12">
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          className="absolute right-5 top-5 text-muted-foreground transition-colors hover:text-ink"
        >
          <X className="h-5 w-5" strokeWidth={1.2} />
        </button>
        <div className="text-center">
          <h2 className="font-display text-3xl text-ink">{title}</h2>
          <Ornament className="mt-4" />
        </div>
        <div className="mt-8">
          <InquiryForm {...props} />
        </div>
      </div>
    </div>
  );
}

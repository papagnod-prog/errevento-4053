import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { ActionButton, Field, inputClass } from "../ui/bits";
import { useSiteSettings, useUpdateSettings } from "../../queries/settings";
import { cn } from "../../lib/utils";

export function SiteSettingsPanel() {
  const settings = useSiteSettings();
  const update = useUpdateSettings();
  const [draft, setDraft] = useState<{ whatsappNumber: string; contactEmail: string } | null>(
    null,
  );
  const [saved, setSaved] = useState(false);

  const current = settings.data;
  const values = draft ?? {
    whatsappNumber: current?.whatsappNumber ?? "",
    contactEmail: current?.contactEmail ?? "",
  };

  const togglePrices = () => {
    if (!current) return;
    update.mutate({ showPrices: !current.showPrices });
  };

  const saveContacts = () => {
    update.mutate(
      { whatsappNumber: values.whatsappNumber, contactEmail: values.contactEmail },
      {
        onSuccess: () => {
          setDraft(null);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      <section className="border border-border bg-card px-6 py-8 sm:px-9">
        <h2 className="font-display text-2xl text-ink">Prezzi nel catalogo</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Con l'interruttore spento i prezzi scompaiono da tutto il sito e al loro posto
          compare l'invito a richiedere un preventivo.
        </p>
        {settings.isLoading ? (
          <div className="mt-6 h-7 w-40 animate-pulse bg-muted" />
        ) : (
          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={!!current?.showPrices}
              aria-label="Mostra i prezzi"
              onClick={togglePrices}
              disabled={update.isPending}
              className={cn(
                "relative h-7 w-13 rounded-full transition-colors duration-300 disabled:opacity-60",
                current?.showPrices ? "bg-accent" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-card shadow transition-all duration-300",
                  current?.showPrices ? "left-7" : "left-1",
                )}
              />
            </button>
            <span className="text-sm text-ink">
              {current?.showPrices ? "Prezzi visibili" : "Prezzi nascosti"}
            </span>
            {update.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>
        )}
      </section>

      <section className="border border-border bg-card px-6 py-8 sm:px-9">
        <h2 className="font-display text-2xl text-ink">Contatti</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Numero WhatsApp ed email usati dai pulsanti e dai form.
        </p>
        {settings.isLoading ? (
          <div className="mt-6 h-16 animate-pulse bg-muted" />
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field label="Numero WhatsApp" hint="Con prefisso, senza + né spazi">
                <input
                  value={values.whatsappNumber}
                  onChange={(event) =>
                    setDraft({ ...values, whatsappNumber: event.target.value })
                  }
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="393391299927"
                />
              </Field>
              <Field label="Email">
                <input
                  value={values.contactEmail}
                  onChange={(event) =>
                    setDraft({ ...values, contactEmail: event.target.value })
                  }
                  className={inputClass}
                  placeholder="info@errevento.it"
                />
              </Field>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <ActionButton
                type="button"
                onClick={saveContacts}
                disabled={update.isPending || !draft}
              >
                {update.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Salva contatti"
                )}
              </ActionButton>
              {saved ? (
                <span className="flex items-center gap-2 text-sm text-accent">
                  <Check className="h-4 w-4" /> Salvato
                </span>
              ) : null}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

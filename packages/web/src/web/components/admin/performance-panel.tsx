import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { ActionButton, Field, inputClass } from "../ui/bits";
import { useSetLeadRate, useStatsOverview, type StatsPreset } from "../../queries/stats";
import { cn } from "../../lib/utils";

const PRESETS: { id: StatsPreset; label: string }[] = [
  { id: "mese-corrente", label: "Mese corrente" },
  { id: "mese-scorso", label: "Mese scorso" },
  { id: "ultimi-30", label: "Ultimi 30 giorni" },
  { id: "anno", label: "Anno" },
  { id: "sempre", label: "Sempre" },
];

const euro = (value: number) =>
  value.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

function Delta({ current, previous }: { current: number; previous: number }) {
  if (!previous && !current) return <span className="text-muted-foreground">—</span>;
  if (!previous) return <span className="text-muted-foreground">nuovo</span>;
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return <span className="text-muted-foreground">stabile</span>;
  return (
    <span className={change > 0 ? "text-ink" : "text-destructive"}>
      {change > 0 ? "+" : ""}
      {change}%
    </span>
  );
}

function Metric({
  label,
  value,
  hint,
  footer,
}: {
  label: string;
  value: string;
  hint?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-card px-5 py-6">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-3xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      {footer ? <p className="mt-3 text-xs">{footer}</p> : null}
    </div>
  );
}

export function PerformancePanel() {
  const [preset, setPreset] = useState<StatsPreset>("mese-corrente");
  const overview = useStatsOverview(preset, true);
  const setRate = useSetLeadRate();
  const [draft, setDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const data = overview.data;
  const rateValue = draft ?? String(data?.leadRate ?? 0);

  const saveRate = () => {
    const value = Number(rateValue.replace(",", "."));
    if (!Number.isFinite(value) || value < 0) return;
    setRate.mutate(
      { value },
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
      <nav className="flex flex-wrap gap-2">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPreset(item.id)}
            className={cn(
              "border px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition-colors",
              preset === item.id
                ? "border-accent bg-accent/10 text-ink"
                : "border-border text-muted-foreground hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {overview.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : overview.isError || !data ? (
        <p className="text-sm text-destructive">
          Non riesco a leggere le statistiche. Prova a rientrare nel pannello.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Periodo: <span className="text-ink">{data.period.label}</span> — confronto con{" "}
            {data.period.previousLabel}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Richieste ricevute"
              value={String(data.current.total)}
              hint={`${data.current.unique} contatti distinti`}
              footer={<Delta current={data.current.total} previous={data.previous.total} />}
            />
            <Metric
              label="Contatti fatturabili"
              value={String(data.current.billable)}
              hint="Distinti e ricontattabili"
              footer={<Delta current={data.current.billable} previous={data.previous.billable} />}
            />
            <Metric
              label="Da fatturare"
              value={euro(data.amountDue)}
              hint={`${data.current.billable} × ${euro(data.leadRate)}`}
              footer={
                <span className="text-muted-foreground">
                  periodo precedente {euro(data.previous.amountDue)}
                </span>
              }
            />
            <Metric
              label="Conversione"
              value={data.current.conversion === null ? "—" : `${data.current.conversion}%`}
              hint={`${data.current.visitors} visitatori, ${data.current.views} pagine viste`}
              footer={
                data.current.conversion === null ? (
                  <span className="text-muted-foreground">visite non ancora rilevate</span>
                ) : (
                  <Delta
                    current={data.current.conversion}
                    previous={data.previous.conversion ?? 0}
                  />
                )
              }
            />
          </div>

          <section className="border border-border bg-card px-6 py-8 sm:px-9">
            <h2 className="font-display text-2xl text-ink">Compenso per contatto</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Importo concordato per ogni contatto fatturabile. Il totale da fatturare si
              aggiorna da solo.
            </p>
            <div className="mt-6 flex flex-wrap items-end gap-4">
              <Field label="Euro per contatto">
                <input
                  value={rateValue}
                  onChange={(event) => setDraft(event.target.value)}
                  className={cn(inputClass, "max-w-[160px]")}
                  inputMode="decimal"
                  placeholder="2,50"
                />
              </Field>
              <ActionButton
                type="button"
                onClick={saveRate}
                disabled={setRate.isPending || draft === null}
              >
                {setRate.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  "Salva"
                )}
              </ActionButton>
            </div>
          </section>

          <section className="border border-border bg-card px-6 py-8 sm:px-9">
            <h2 className="font-display text-2xl text-ink">Provenienza delle richieste</h2>
            {!data.current.bySource.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nessuna richiesta in questo periodo.
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {data.current.bySource.map((row) => {
                  const share = Math.round((row.count / data.current.total) * 100);
                  return (
                    <li key={row.label}>
                      <div className="flex items-baseline justify-between gap-4 text-sm">
                        <span className="text-ink">{row.label}</span>
                        <span className="text-muted-foreground">
                          {row.count} · {share}%
                        </span>
                      </div>
                      <div className="mt-2 h-1 bg-muted">
                        <div className="h-full bg-accent" style={{ width: `${share}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {data.current.unreachable > 0 ? (
              <p className="mt-6 text-xs text-muted-foreground">
                {data.current.unreachable} richieste senza telefono né email: escluse dal
                conteggio fatturabile.
              </p>
            ) : null}
          </section>

          <section className="border border-border bg-card px-6 py-8 sm:px-9">
            <h2 className="font-display text-2xl text-ink">Pagine più viste</h2>
            {!data.topPages.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nessuna visita registrata in questo periodo.
                {data.trackingSince
                  ? ` Il conteggio parte dal ${data.trackingSince}.`
                  : " Il conteggio parte dalla pubblicazione di questo aggiornamento."}
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-border text-sm">
                {data.topPages.map((row) => (
                  <li key={row.path} className="flex justify-between gap-4 py-2">
                    <span className="truncate text-ink">{row.path}</span>
                    <span className="text-muted-foreground">{row.views}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Il sito registra i contatti, non le vendite: non essendoci carrello né checkout,
            nessun dato dice se una richiesta è diventata un ordine. La conversione qui è
            visitatori → richieste. I visitatori sono conteggiati senza cookie, con un
            identificativo giornaliero non riconducibile alla persona.
          </p>
        </>
      )}
    </div>
  );
}

import { Trash2 } from "lucide-react";
import { useAdminInquiries, useDeleteInquiry } from "../../queries/settings";

function formatDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InquiriesPanel() {
  const inquiries = useAdminInquiries(true);
  const remove = useDeleteInquiry();

  return (
    <section className="border border-border bg-card px-5 py-8 sm:px-9">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl text-ink">Richieste ricevute</h2>
        <span className="text-sm text-muted-foreground">
          {inquiries.data ? `${inquiries.data.length} totali` : ""}
        </span>
      </div>

      {inquiries.isLoading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse bg-muted" />
          ))}
        </div>
      ) : inquiries.isError ? (
        <p className="mt-6 text-sm text-destructive">
          Non riesco a leggere le richieste. Prova a rientrare.
        </p>
      ) : !inquiries.data?.length ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Nessuna richiesta ricevuta per ora.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-border">
          {inquiries.data.map((row) => (
            <article key={row.id} className="flex gap-5 py-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-xl text-ink">{row.name}</h3>
                  <span className="eyebrow text-[9px]">{row.source}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {[
                    row.phone,
                    row.email,
                    row.eventType,
                    row.eventDate,
                    row.quantity && `qtà ${row.quantity}`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Nessun dettaglio"}
                </p>
                {row.productName ? (
                  <p className="mt-1.5 text-sm text-ink">Prodotto: {row.productName}</p>
                ) : null}
                {row.message ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    «{row.message}»
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label={`Elimina richiesta di ${row.name}`}
                onClick={() => remove.mutate({ id: row.id })}
                disabled={remove.isPending}
                className="h-9 w-9 shrink-0 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.3} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

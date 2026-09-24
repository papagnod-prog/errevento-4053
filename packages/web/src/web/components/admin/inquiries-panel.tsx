import { useState } from "react";
import { ShieldAlert, Trash2 } from "lucide-react";
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

/** Da quale modulo del sito è partita la richiesta, scritto per intero. */
const ORIGINE: Record<string, string> = {
  prodotto: "da scheda articolo",
  allestimenti: "da pagina Allestimenti",
  contatti: "da pagina Contatti",
  "wedding-planner": "da pagina Wedding planner",
};

/** Una riga così come arriva dal pannello, senza ridichiararne i campi. */
type Inquiry = NonNullable<ReturnType<typeof useAdminInquiries>["data"]>[number];

function InquiryRow({
  row,
  onDelete,
  deleting,
}: {
  row: Inquiry;
  onDelete: (id: number) => void;
  deleting: boolean;
}) {
  return (
    <article className="flex gap-5 py-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-xl text-ink">{row.name}</h3>
          <span className="eyebrow text-[9px]">{ORIGINE[row.source] ?? row.source}</span>
          <span className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>
        </div>
        {row.flagged && row.flagReason ? (
          <p className="mt-2 text-xs text-destructive">Motivo: {row.flagReason}</p>
        ) : null}
        <p className="mt-2 break-words text-sm text-muted-foreground">
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
          <p className="mt-1.5 break-words text-sm leading-relaxed text-muted-foreground">
            «{row.message}»
          </p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label={`Elimina richiesta di ${row.name}`}
        onClick={() => onDelete(row.id)}
        disabled={deleting}
        className="h-9 w-9 shrink-0 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.3} />
      </button>
    </article>
  );
}

export function InquiriesPanel() {
  const inquiries = useAdminInquiries(true);
  const remove = useDeleteInquiry();
  const [showFlagged, setShowFlagged] = useState(false);

  const rows = inquiries.data ?? [];
  const good = rows.filter((row) => !row.flagged);
  const flagged = rows.filter((row) => row.flagged);
  const onDelete = (id: number) => remove.mutate({ id });

  return (
    <section className="border border-border bg-card px-5 py-8 sm:px-9">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl text-ink">Richieste ricevute</h2>
        <span className="text-sm text-muted-foreground">
          {inquiries.data ? `${good.length} da leggere` : ""}
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
      ) : (
        <>
          {!good.length ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Nessuna richiesta ricevuta per ora.
            </p>
          ) : (
            <div className="mt-6 divide-y divide-border">
              {good.map((row) => (
                <InquiryRow
                  key={row.id}
                  row={row}
                  onDelete={onDelete}
                  deleting={remove.isPending}
                />
              ))}
            </div>
          )}

          {/*
            Richieste che le difese del modulo ritengono automatiche: restano
            qui, senza avviso su Telegram. Si controllano quando si vuole, così
            un cliente vero bloccato per errore non va comunque perduto.
          */}
          {flagged.length ? (
            <div className="mt-8 border-t border-border pt-6">
              <button
                type="button"
                onClick={() => setShowFlagged((open) => !open)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="flex items-center gap-2 text-sm text-ink">
                  <ShieldAlert className="h-4 w-4 text-destructive" strokeWidth={1.4} />
                  Sospette, messe da parte ({flagged.length})
                </span>
                <span className="eyebrow text-[9px] text-muted-foreground">
                  {showFlagged ? "nascondi" : "mostra"}
                </span>
              </button>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Sembrano inviate da un programma automatico: non hanno fatto
                scattare alcun avviso. Controllale quando vuoi ed elimina quelle
                che non ti servono.
              </p>
              {showFlagged ? (
                <div className="mt-2 divide-y divide-border opacity-80">
                  {flagged.map((row) => (
                    <InquiryRow
                      key={row.id}
                      row={row}
                      onDelete={onDelete}
                      deleting={remove.isPending}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

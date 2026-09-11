import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { ActionButton, Field, inputClass } from "../ui/bits";
import {
  useAdminCategories,
  useDeleteCategory,
  useSaveCategory,
} from "../../queries/admin";

type Draft = {
  id?: number;
  name: string;
  parentId: number | null;
  sortOrder: string;
};

export function CategoriesPanel() {
  const categories = useAdminCategories(true);
  const save = useSaveCategory();
  const remove = useDeleteCategory();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");

  const rows = categories.data ?? [];
  const parents = rows.filter((c) => c.parentId === null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft || save.isPending) return;
    setError("");
    save.mutate(
      {
        id: draft.id,
        name: draft.name.trim(),
        parentId: draft.parentId,
        sortOrder: Number(draft.sortOrder) || 0,
      },
      {
        onSuccess: () => setDraft(null),
        onError: (err) => setError(err.message || "Salvataggio non riuscito."),
      },
    );
  };

  return (
    <section className="border border-border bg-card px-5 py-8 sm:px-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Categorie</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Struttura dei filtri e del menu del catalogo.
          </p>
        </div>
        <ActionButton
          type="button"
          className="px-6 py-3"
          onClick={() => setDraft({ name: "", parentId: null, sortOrder: "0" })}
        >
          <Plus className="h-4 w-4" /> Nuova categoria
        </ActionButton>
      </div>

      {categories.isLoading ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {parents.map((parent) => {
            const children = rows.filter((c) => c.parentId === parent.id);
            return (
              <li key={parent.id} className="py-4">
                <Row
                  name={parent.name}
                  meta={`${parent.productCount} prodotti · ordine ${parent.sortOrder}`}
                  onEdit={() =>
                    setDraft({
                      id: parent.id,
                      name: parent.name,
                      parentId: null,
                      sortOrder: String(parent.sortOrder),
                    })
                  }
                  onDelete={() => remove.mutate({ id: parent.id })}
                  pending={remove.isPending}
                />
                {children.length > 0 ? (
                  <ul className="mt-3 space-y-3 border-l border-border pl-5">
                    {children.map((child) => (
                      <li key={child.id}>
                        <Row
                          small
                          name={child.name}
                          meta={`${child.ownCount} prodotti · ordine ${child.sortOrder}`}
                          onEdit={() =>
                            setDraft({
                              id: child.id,
                              name: child.name,
                              parentId: child.parentId,
                              sortOrder: String(child.sortOrder),
                            })
                          }
                          onDelete={() => remove.mutate({ id: child.id })}
                          pending={remove.isPending}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {remove.isError ? (
        <p className="mt-5 text-sm text-destructive">{remove.error.message}</p>
      ) : null}

      {draft ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-ink/50 px-5">
          <form
            onSubmit={submit}
            className="w-full max-w-md border border-border bg-card px-7 py-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl text-ink">
                {draft.id ? "Modifica categoria" : "Nuova categoria"}
              </h3>
              <button
                type="button"
                onClick={() => setDraft(null)}
                aria-label="Chiudi"
                className="p-1 text-muted-foreground hover:text-ink"
              >
                <X className="h-5 w-5" strokeWidth={1.4} />
              </button>
            </div>
            <div className="mt-7 space-y-6">
              <Field label="Nome">
                <input
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  className={inputClass}
                  autoFocus
                />
              </Field>
              <Field label="Categoria superiore" hint="Vuoto = categoria principale">
                <select
                  value={draft.parentId ?? ""}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      parentId: event.target.value ? Number(event.target.value) : null,
                    })
                  }
                  className={inputClass}
                >
                  <option value="">Nessuna</option>
                  {parents
                    .filter((p) => p.id !== draft.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Ordine">
                <input
                  value={draft.sortOrder}
                  onChange={(event) => setDraft({ ...draft, sortOrder: event.target.value })}
                  className={inputClass}
                  inputMode="numeric"
                />
              </Field>
            </div>
            {error ? <p className="mt-5 text-sm text-destructive">{error}</p> : null}
            <div className="mt-8 flex items-center gap-4">
              <ActionButton type="submit" disabled={draft.name.trim().length < 2 || save.isPending}>
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salva"}
              </ActionButton>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="link-underline text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function Row({
  name,
  meta,
  onEdit,
  onDelete,
  pending,
  small,
}: {
  name: string;
  meta: string;
  onEdit: () => void;
  onDelete: () => void;
  pending: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <p
          className={
            small ? "truncate text-sm text-ink" : "truncate font-display text-lg text-ink"
          }
        >
          {name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>
      </div>
      <button
        type="button"
        aria-label={`Modifica ${name}`}
        onClick={onEdit}
        className="p-2 text-muted-foreground hover:text-ink"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.4} />
      </button>
      <button
        type="button"
        aria-label={`Elimina ${name}`}
        onClick={onDelete}
        disabled={pending}
        className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.4} />
      </button>
    </div>
  );
}

import { useState } from "react";
import { Check, KeyRound, Loader2, Plus, Trash2, X } from "lucide-react";
import { ActionButton, Field, inputClass } from "../ui/bits";
import {
  useAdminUsers,
  useCreateUser,
  useDeleteUser,
  useSetUserPassword,
} from "../../queries/admin";

function formatDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function UsersPanel({ currentUserId }: { currentUserId: string }) {
  const users = useAdminUsers(true);
  const create = useCreateUser();
  const remove = useDeleteUser();
  const setPassword = useSetUserPassword();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [passwordFor, setPasswordFor] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const submitCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (create.isPending) return;
    setError("");
    create.mutate(
      { name: form.name.trim(), email: form.email.trim(), password: form.password },
      {
        onSuccess: () => {
          setForm({ name: "", email: "", password: "" });
          setShowForm(false);
          setDone("Accesso creato.");
          window.setTimeout(() => setDone(""), 2500);
        },
        onError: (err) => setError(err.message || "Creazione non riuscita."),
      },
    );
  };

  const submitPassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordFor || setPassword.isPending) return;
    setError("");
    setPassword.mutate(
      { id: passwordFor.id, password: newPassword },
      {
        onSuccess: () => {
          setPasswordFor(null);
          setNewPassword("");
          setDone("Password aggiornata.");
          window.setTimeout(() => setDone(""), 2500);
        },
        onError: (err) => setError(err.message || "Aggiornamento non riuscito."),
      },
    );
  };

  return (
    <section className="border border-border bg-card px-5 py-8 sm:px-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Accessi al pannello</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Ogni persona ha la sua email e la sua password.
          </p>
        </div>
        <ActionButton
          type="button"
          className="px-6 py-3"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Chiudi
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Nuovo accesso
            </>
          )}
        </ActionButton>
      </div>

      {showForm ? (
        <form onSubmit={submitCreate} className="mt-8 border border-border bg-background px-5 py-6 sm:px-7">
          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Nome">
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className={inputClass}
                placeholder="Maria"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className={inputClass}
                placeholder="maria@errevento.it"
                autoComplete="off"
              />
            </Field>
            <Field label="Password" hint="Almeno 8 caratteri">
              <input
                type="text"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className={inputClass}
                autoComplete="new-password"
              />
            </Field>
          </div>
          <ActionButton
            type="submit"
            className="mt-7"
            disabled={
              !form.name || !form.email || form.password.length < 8 || create.isPending
            }
          >
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crea accesso"}
          </ActionButton>
        </form>
      ) : null}

      {error ? <p className="mt-5 text-sm text-destructive">{error}</p> : null}
      {done ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-accent">
          <Check className="h-4 w-4" /> {done}
        </p>
      ) : null}

      {users.isLoading ? (
        <div className="mt-8 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {(users.data ?? []).map((user) => (
            <li key={user.id} className="flex items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-ink">
                  {user.name}
                  {user.id === currentUserId ? (
                    <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-accent">
                      tu
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {user.email} · dal {formatDate(user.createdAt)}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Cambia password di ${user.name}`}
                onClick={() => setPasswordFor({ id: user.id, name: user.name })}
                className="p-2 text-muted-foreground hover:text-ink"
              >
                <KeyRound className="h-4 w-4" strokeWidth={1.4} />
              </button>
              {confirmId === user.id ? (
                <span className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em]">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmId(null);
                      remove.mutate(
                        { id: user.id },
                        { onError: (err) => setError(err.message) },
                      );
                    }}
                    disabled={remove.isPending}
                    className="text-destructive hover:underline disabled:opacity-50"
                  >
                    Elimina
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="text-muted-foreground hover:text-ink"
                  >
                    Annulla
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  aria-label={`Elimina ${user.name}`}
                  onClick={() => setConfirmId(user.id)}
                  disabled={user.id === currentUserId || remove.isPending}
                  className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.4} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {passwordFor ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-ink/50 px-5">
          <form
            onSubmit={submitPassword}
            className="w-full max-w-sm border border-border bg-card px-7 py-8"
          >
            <h3 className="font-display text-2xl text-ink">Nuova password</h3>
            <p className="mt-2 text-sm text-muted-foreground">Per {passwordFor.name}.</p>
            <div className="mt-6">
              <Field label="Password" hint="Almeno 8 caratteri">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={inputClass}
                  autoFocus
                  autoComplete="new-password"
                />
              </Field>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <ActionButton
                type="submit"
                disabled={newPassword.length < 8 || setPassword.isPending}
              >
                {setPassword.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Aggiorna"
                )}
              </ActionButton>
              <button
                type="button"
                onClick={() => {
                  setPasswordFor(null);
                  setNewPassword("");
                }}
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

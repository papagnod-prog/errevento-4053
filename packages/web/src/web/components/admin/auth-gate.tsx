import { useState } from "react";
import { Loader2, Lock, UserPlus } from "lucide-react";
import { ActionButton, Field, Ornament, inputClass } from "../ui/bits";
import { authClient } from "../../lib/auth";
import { useNeedsSetup, useSetupFirstUser } from "../../queries/admin";

function Card({
  icon,
  title,
  intro,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-5">
      <div className="border border-border bg-card px-7 py-10 sm:px-10">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blush">
            {icon}
          </div>
          <h1 className="mt-5 font-display text-3xl text-ink">{title}</h1>
          <Ornament className="mt-4" />
          {intro ? (
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{intro}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);
    const result = await authClient.signIn.email({ email: email.trim(), password });
    setPending(false);
    if (result.error) {
      setError(
        result.error.status === 401 || result.error.status === 403
          ? "Email o password non corretti."
          : result.error.message || "Accesso non riuscito.",
      );
    }
  };

  return (
    <Card
      icon={<Lock className="h-5 w-5 text-accent" strokeWidth={1.4} />}
      title="Area riservata"
      intro="Accedi con la tua email per gestire il catalogo."
    >
      <form onSubmit={submit} className="mt-8 space-y-6 text-left">
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            placeholder="nome@errevento.it"
            autoComplete="username"
            autoFocus
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Field>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <ActionButton
          type="submit"
          disabled={!email || !password || pending}
          className="w-full"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entra"}
        </ActionButton>
      </form>
    </Card>
  );
}

function SetupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setup = useSetupFirstUser();
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (setup.isPending) return;
    setError("");
    setup.mutate(
      { name: name.trim(), email: email.trim(), password },
      {
        onSuccess: async () => {
          await authClient.signIn.email({ email: email.trim(), password });
        },
        onError: (err) => setError(err.message || "Creazione non riuscita."),
      },
    );
  };

  return (
    <Card
      icon={<UserPlus className="h-5 w-5 text-accent" strokeWidth={1.4} />}
      title="Primo accesso"
      intro="Crea l'account principale del pannello. Gli altri accessi si aggiungono da dentro."
    >
      <form onSubmit={submit} className="mt-8 space-y-6 text-left">
        <Field label="Nome">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            placeholder="Errevento"
            autoFocus
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            placeholder="info@errevento.it"
            autoComplete="username"
          />
        </Field>
        <Field label="Password" hint="Almeno 8 caratteri">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <ActionButton
          type="submit"
          disabled={!name || !email || password.length < 8 || setup.isPending}
          className="w-full"
        >
          {setup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crea accesso"}
        </ActionButton>
      </form>
    </Card>
  );
}

/** Mostra il login, oppure la creazione del primo utente se il pannello è vuoto. */
export function AuthGate() {
  const needsSetup = useNeedsSetup();

  if (needsSetup.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return needsSetup.data?.needsSetup ? <SetupForm /> : <SignInForm />;
}

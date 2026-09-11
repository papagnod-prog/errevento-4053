import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Eyebrow } from "../components/ui/bits";
import { AuthGate } from "../components/admin/auth-gate";
import { ProductsPanel } from "../components/admin/products-panel";
import { CategoriesPanel } from "../components/admin/categories-panel";
import { InquiriesPanel } from "../components/admin/inquiries-panel";
import { PerformancePanel } from "../components/admin/performance-panel";
import { SiteSettingsPanel } from "../components/admin/site-settings-panel";
import { UsersPanel } from "../components/admin/users-panel";
import { authClient, signOut } from "../lib/auth";
import { cn } from "../lib/utils";

const TABS = [
  { id: "prodotti", label: "Prodotti" },
  { id: "categorie", label: "Categorie" },
  { id: "richieste", label: "Richieste" },
  { id: "rendimento", label: "Rendimento" },
  { id: "impostazioni", label: "Impostazioni" },
  { id: "utenti", label: "Utenti" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const [tab, setTab] = useState<TabId>("prodotti");
  const [leaving, setLeaving] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-36">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="pb-28 pt-36 lg:pt-44">
        <AuthGate />
      </div>
    );
  }

  const logout = async () => {
    setLeaving(true);
    try {
      await signOut();
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="pb-28 pt-36 lg:pt-44">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Pannello</Eyebrow>
            <h1 className="display-lg mt-3 text-ink">Gestione sito</h1>
          </div>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <span className="normal-case tracking-normal text-sm text-ink">
              {session.user.name || session.user.email}
            </span>
            <button
              type="button"
              onClick={logout}
              disabled={leaving}
              className="link-underline uppercase tracking-[0.24em] disabled:opacity-50"
            >
              {leaving ? "…" : "Esci"}
            </button>
          </div>
        </div>

        <nav className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-b border-border">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "-mb-px border-b pb-3 text-[11px] uppercase tracking-[0.24em] transition-colors",
                tab === item.id
                  ? "border-accent text-ink"
                  : "border-transparent text-muted-foreground hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-12">
          {tab === "prodotti" ? <ProductsPanel /> : null}
          {tab === "categorie" ? <CategoriesPanel /> : null}
          {tab === "richieste" ? <InquiriesPanel /> : null}
          {tab === "rendimento" ? <PerformancePanel /> : null}
          {tab === "impostazioni" ? <SiteSettingsPanel /> : null}
          {tab === "utenti" ? <UsersPanel currentUserId={session.user.id} /> : null}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Phone, Search, X } from "lucide-react";
import { NAV, SITE } from "../lib/site";
import { useCategories } from "../queries/catalog";
import { cn } from "../lib/utils";

export function SiteHeader() {
  const [location, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const categories = useCategories();

  const isHome = location === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = scrolled || !isHome || menuOpen;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = term.trim();
    setSearchOpen(false);
    setTerm("");
    navigate(value ? `/catalogo?q=${encodeURIComponent(value)}` : "/catalogo");
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-90 transition-all duration-500",
        solid
          ? "border-b border-border bg-background/95 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between gap-6 px-5 lg:h-24 lg:px-8">
        <nav className="hidden flex-1 items-center gap-8 lg:flex">
          {NAV.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "link-underline whitespace-nowrap font-body text-[11px] uppercase tracking-[0.24em] transition-colors",
                location.startsWith(item.href) ? "text-accent" : "text-ink hover:text-accent",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="flex items-center gap-3 lg:justify-center">
          <img
            src="/images/site/logo-errevento.png"
            alt="Errevento di Rossella Ferrucci"
            className="h-14 w-auto lg:h-[74px]"
          />
        </Link>

        <div className="hidden flex-1 items-center justify-end gap-8 lg:flex">
          {NAV.slice(3).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "link-underline whitespace-nowrap font-body text-[11px] uppercase tracking-[0.24em] transition-colors",
                location.startsWith(item.href) ? "text-accent" : "text-ink hover:text-accent",
              )}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            aria-label="Cerca nel catalogo"
            onClick={() => setSearchOpen((v) => !v)}
            className="text-ink transition-colors hover:text-accent"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.3} />
          </button>
        </div>

        <div className="flex items-center gap-5 lg:hidden">
          <button
            type="button"
            aria-label="Cerca nel catalogo"
            onClick={() => setSearchOpen((v) => !v)}
            className="text-ink"
          >
            <Search className="h-[19px] w-[19px]" strokeWidth={1.3} />
          </button>
          <button
            type="button"
            aria-label="Apri il menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="text-ink"
          >
            {menuOpen ? (
              <X className="h-6 w-6" strokeWidth={1.2} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.2} />
            )}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-border bg-background px-5 py-5 lg:px-8">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-2xl items-center gap-4">
            <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.3} />
            <input
              autoFocus
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Cerca tra oltre 750 articoli, anche per codice…"
              className="flex-1 border-0 bg-transparent py-1 font-body text-[15px] text-ink outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              className="font-body text-[11px] uppercase tracking-[0.22em] text-accent"
            >
              Cerca
            </button>
          </form>
        </div>
      ) : null}

      {menuOpen ? (
        <div className="h-[calc(100vh-5rem)] overflow-y-auto border-t border-border bg-background px-6 py-8 lg:hidden">
          <div className="flex flex-col gap-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="font-display text-3xl text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-10 border-t border-border pt-8">
            <p className="eyebrow">Il catalogo</p>
            <div className="mt-4 flex flex-col gap-3">
              {(categories.data ?? []).map((category) => (
                <Link
                  key={category.slug}
                  to={`/catalogo?categoria=${category.slug}`}
                  className="flex items-center justify-between text-[15px] text-ink"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {category.productCount}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <a
            href={SITE.phoneHref}
            className="mt-10 flex items-center gap-3 text-[15px] text-accent"
          >
            <Phone className="h-4 w-4" strokeWidth={1.3} /> {SITE.phone}
          </a>
        </div>
      ) : null}
    </header>
  );
}

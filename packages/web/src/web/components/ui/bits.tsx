import { Link } from "wouter";
import { cn } from "../../lib/utils";

export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("ornament", className)} aria-hidden="true">
      <span />
    </div>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "reveal",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="display-lg mt-5 text-ink">{title}</h2>
      <Ornament className={cn("mt-6", align === "left" && "justify-start")} />
      {intro ? (
        <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{intro}</p>
      ) : null}
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 border px-8 py-3.5 font-body text-[11px] font-normal uppercase tracking-[0.24em] transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  solid: "border-ink bg-ink text-background hover:bg-transparent hover:text-ink",
  outline: "border-ink/50 text-ink hover:border-ink hover:bg-ink hover:text-background",
  light:
    "border-background/70 text-background hover:bg-background hover:text-ink",
  whatsapp:
    "border-whatsapp bg-whatsapp text-white hover:bg-transparent hover:text-whatsapp",
} as const;

type Variant = keyof typeof variants;

export function ButtonLink({
  to,
  href,
  children,
  variant = "solid",
  className,
  target,
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  target?: string;
}) {
  const classes = cn(buttonBase, variants[variant], className);
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={classes}
      target={target}
      rel={target === "_blank" ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

export function ActionButton({
  children,
  variant = "solid",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={cn(buttonBase, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow block text-[10px]">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 font-body text-[15px] text-ink outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent";

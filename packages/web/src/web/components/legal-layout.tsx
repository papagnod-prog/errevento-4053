import { Eyebrow, Ornament } from "./ui/bits";
import { useReveal } from "../hooks/use-reveal";

export type LegalBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export function LegalPage({
  eyebrow,
  title,
  updated,
  blocks,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  blocks: LegalBlock[];
}) {
  useReveal();

  return (
    <>
      <section className="bg-blush/60 pb-16 pt-36 lg:pb-20 lg:pt-44">
        <div className="mx-auto max-w-2xl px-5 text-center lg:px-8">
          <Eyebrow className="reveal">{eyebrow}</Eyebrow>
          <h1 className="display-lg reveal mt-5 text-ink">{title}</h1>
          <Ornament className="reveal mt-7" />
          <p className="reveal mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Ultimo aggiornamento: {updated}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="space-y-6">
          {blocks.map((block, index) => {
            if (block.type === "h2") {
              return (
                <h2
                  key={index}
                  className="font-display text-2xl text-ink first:mt-0 mt-14 border-b border-border pb-4"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "h3") {
              return (
                <h3
                  key={index}
                  className="mt-10 font-body text-[11px] uppercase tracking-[0.24em] text-accent"
                >
                  {block.text}
                </h3>
              );
            }
            if (block.type === "ul") {
              return (
                <ul key={index} className="space-y-3 pl-5">
                  {block.items.map((item, i) => (
                    <li
                      key={i}
                      className="list-disc text-[15px] leading-relaxed text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className="text-[15px] leading-relaxed text-muted-foreground">
                {block.text}
              </p>
            );
          })}
        </div>
      </section>
    </>
  );
}

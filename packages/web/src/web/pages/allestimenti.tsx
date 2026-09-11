import { InquiryForm } from "../components/inquiry-form";
import { ButtonLink, Eyebrow, Ornament, SectionHeading } from "../components/ui/bits";
import { useReveal } from "../hooks/use-reveal";
import { ALLESTIMENTI } from "../lib/site";

const STEPS = [
  {
    n: "01",
    title: "Sopralluogo",
    text: "Visitiamo la location, prendiamo le misure e capiamo cosa valorizzare e cosa nascondere.",
  },
  {
    n: "02",
    title: "Progetto",
    text: "Palette, materiali e disegno dell'allestimento, con un preventivo chiaro e dettagliato.",
  },
  {
    n: "03",
    title: "Realizzazione",
    text: "Confezioniamo e assembliamo in laboratorio ogni elemento del coordinato.",
  },
  {
    n: "04",
    title: "Montaggio",
    text: "Arriviamo prima degli ospiti, montiamo tutto e smontiamo a festa finita.",
  },
];

export default function AllestimentiPage() {
  useReveal();

  return (
    <>
      <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden">
        <img
          src="/images/site/Allestimenti.jpg"
          alt="Allestimento realizzato da Errevento"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="relative mx-auto max-w-2xl px-5 pt-24 pb-16 text-center lg:px-8">
          <Eyebrow className="reveal !text-background/80">Allestimenti & scenografie</Eyebrow>
          <h1 className="display-lg reveal mt-5 text-background">
            Diamo forma allo spazio
            <br />
            <em className="font-light italic">della vostra festa</em>
          </h1>
          <p className="reveal mx-auto mt-7 max-w-lg text-[15px] leading-relaxed text-background/85">
            Chiesa, sala, giardino o casa: progettiamo, realizziamo e montiamo ogni
            dettaglio, dal fondale fotografico ai centrotavola.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
        <SectionHeading
          eyebrow="Le occasioni"
          title="Cosa allestiamo"
          intro="Ogni progetto è su misura: queste sono le tipologie che curiamo più spesso."
        />
        <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {ALLESTIMENTI.map((item, index) => (
            <article
              key={item.title}
              className="reveal group text-center"
              style={{ transitionDelay: `${(index % 3) * 90}ms` }}
            >
              <div className="overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={`Allestimento ${item.title}`}
                  loading="lazy"
                  className="aspect-4/5 w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
              </div>
              <h3 className="mt-7 font-display text-[26px] text-ink">{item.title}</h3>
              <p className="mx-auto mt-3 max-w-[19rem] text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-blush/45 py-24 lg:py-32">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
          <SectionHeading eyebrow="Come lavoriamo" title="Dal sopralluogo alla festa" />
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <div
                key={step.n}
                className="reveal text-center"
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <p className="font-display text-4xl text-gold">{step.n}</p>
                <Ornament className="mt-4" />
                <h3 className="mt-5 font-display text-[22px] text-ink">{step.title}</h3>
                <p className="mx-auto mt-2.5 max-w-[17rem] text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Parliamone"
              title="Raccontaci il tuo evento"
              intro="Compila i campi essenziali: la richiesta arriva direttamente in chat e ti rispondiamo con idee e preventivo."
            />
            <div className="reveal mt-10 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Lavoriamo a Corato e in tutta la provincia di Bari. Per date molto richieste
                conviene scriverci con qualche mese di anticipo.
              </p>
            </div>
            <div className="reveal mt-10">
              <ButtonLink to="/catalogo" variant="outline">
                Guarda anche il catalogo
              </ButtonLink>
            </div>
          </div>
          <div className="reveal border border-border bg-card px-6 py-10 sm:px-10">
            <InquiryForm source="allestimenti" />
          </div>
        </div>
      </section>
    </>
  );
}

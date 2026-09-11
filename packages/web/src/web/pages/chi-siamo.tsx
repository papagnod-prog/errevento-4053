import { Eyebrow, ButtonLink, Ornament, SectionHeading } from "../components/ui/bits";
import { useReveal } from "../hooks/use-reveal";
import { SITE } from "../lib/site";

const STRENGTHS = [
  {
    title: "Matrimonio",
    text: "Coordinati completi: partecipazioni, libretti, bomboniere, confettata e allestimenti.",
    image: "/images/site/IMG_20220124_115907.jpg",
  },
  {
    title: "Diciottesimo",
    text: "Feste che parlano di chi le vive: temi, colori e scenografie personalizzate.",
    image: "/images/site/IMG_20220124_190624.jpg",
  },
  {
    title: "Battesimo",
    text: "Dettagli delicati per il primo grande giorno, dalla chiesa alla tavola.",
    image: "/images/site/IMG_20220128_190300.jpg",
  },
  {
    title: "Comunione",
    text: "Ricordi da conservare: bomboniere artigianali e confettate su misura.",
    image: "/images/site/IMG_20220124_190515.jpg",
  },
];

const TIMELINE = [
  {
    year: "1999",
    title: "L'inizio",
    text: "Apriamo a Corato con una piccola selezione di bomboniere e un'idea precisa: ascoltare prima di proporre.",
  },
  {
    year: "2010",
    title: "Il laboratorio",
    text: "Nasce lo spazio dove confezioniamo, incidiamo e assembliamo a mano i coordinati.",
  },
  {
    year: "2018",
    title: "Gli allestimenti",
    text: "Il servizio si estende alle scenografie complete per cerimonie e feste private.",
  },
  {
    year: "Oggi",
    title: "Wedding planning",
    text: "Accompagniamo le coppie in tutto il percorso, dai fornitori all'ultimo dettaglio.",
  },
];

export default function ChiSiamoPage() {
  useReveal();

  return (
    <>
      <section className="bg-blush/60 pb-20 pt-36 lg:pb-28 lg:pt-44">
        <div className="mx-auto max-w-2xl px-5 text-center lg:px-8">
          <Eyebrow className="reveal">La nostra storia</Eyebrow>
          <h1 className="display-lg reveal mt-5 text-ink">
            Dal {SITE.since} il nostro impegno
            <br />
            <em className="font-light italic">nel curare ogni dettaglio</em>
          </h1>
          <Ornament className="reveal mt-7" />
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="reveal overflow-hidden">
            <img
              src="/images/site/white-sugared-almonds-on-glasses-and-gift-boxes-scaled.jpg"
              alt="Confettata allestita da Errevento"
              className="aspect-4/5 w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <h2 className="display-lg reveal text-ink">Ascoltare, immaginare, realizzare</h2>
            <Ornament className="reveal mt-6 justify-start" />
            <div className="reveal mt-8 space-y-5 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                Ascoltare ogni richiesta, ogni desiderio del cliente e trasformarlo in
                realtà, aggiungendo un pizzico di esperienza, di fantasia e quel tocco che
                personalizza ogni evento.
              </p>
              <p>
                Siamo alla ricerca continua di innovazioni, nuove tendenze e nuove idee nel
                settore: ogni stagione la nostra selezione cambia, si affina, si arricchisce.
              </p>
              <p>
                Il giorno di festa dei nostri clienti è anche il nostro, e ci piace renderlo
                memorabile: che sia un matrimonio, un compleanno, una comunione, un battesimo
                o una qualsiasi ricorrenza.
              </p>
            </div>
            <p className="reveal mt-9 font-display text-2xl italic text-accent">
              — Rossella Ferrucci
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-blush/40 py-24 lg:py-32">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
          <SectionHeading
            eyebrow="I nostri punti di forza"
            title="Le occasioni che curiamo"
            intro="Ogni ricorrenza ha bisogno di un linguaggio suo: qui trovate quelle che seguiamo più spesso."
          />
          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {STRENGTHS.map((item, index) => (
              <div
                key={item.title}
                className="reveal text-center"
                style={{ transitionDelay: `${(index % 4) * 90}ms` }}
              >
                <div className="overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="aspect-3/4 w-full object-cover"
                  />
                </div>
                <h3 className="mt-6 font-display text-[22px] text-ink">{item.title}</h3>
                <p className="mx-auto mt-2.5 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
        <SectionHeading eyebrow="Il percorso" title="Venticinque anni di feste" />
        <div className="mx-auto mt-16 max-w-3xl">
          {TIMELINE.map((step, index) => (
            <div
              key={step.year}
              className="reveal grid gap-4 border-t border-border py-9 sm:grid-cols-[120px_1fr] sm:gap-10"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <p className="font-display text-2xl text-gold">{step.year}</p>
              <div>
                <h3 className="font-display text-[22px] text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="reveal mt-16 text-center">
          <ButtonLink to="/catalogo" variant="solid">
            Sfoglia il catalogo
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

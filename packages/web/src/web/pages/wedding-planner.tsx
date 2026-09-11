import { InquiryForm } from "../components/inquiry-form";
import { Eyebrow, Ornament, SectionHeading } from "../components/ui/bits";
import { useReveal } from "../hooks/use-reveal";

const SERVICES = [
  {
    title: "Consulenza di stile",
    text: "Definiamo insieme atmosfera, palette e filo conduttore, dall'invito alla bomboniera.",
  },
  {
    title: "Selezione fornitori",
    text: "Location, catering, fiori, musica e foto: proponiamo solo chi conosciamo davvero.",
  },
  {
    title: "Coordinati cartacei",
    text: "Save the date, partecipazioni, libretti messa, menù, tableau e segnaposto.",
  },
  {
    title: "Allestimenti",
    text: "Chiesa, sala, confettata e angoli fotografici, montati e smontati da noi.",
  },
  {
    title: "Gestione budget",
    text: "Un prospetto chiaro delle spese, aggiornato a ogni scelta, senza sorprese.",
  },
  {
    title: "Regia del giorno",
    text: "Timeline minuto per minuto e presenza sul posto per far filare tutto liscio.",
  },
];

const PATH = [
  {
    n: "01",
    title: "Primo incontro",
    text: "Ci raccontate come immaginate la giornata. Ascoltiamo, prendiamo appunti, nessun impegno.",
  },
  {
    n: "02",
    title: "Proposta",
    text: "Mood board, ipotesi di budget e calendario delle decisioni da prendere.",
  },
  {
    n: "03",
    title: "Preparazione",
    text: "Appuntamenti con i fornitori, prove, campioni e approvazione di ogni dettaglio.",
  },
  {
    n: "04",
    title: "Il giorno",
    text: "Noi in regia dall'alba: voi pensate solo a viverlo.",
  },
];

export default function WeddingPlannerPage() {
  useReveal();

  return (
    <>
      <section className="relative flex min-h-[64vh] items-center justify-center overflow-hidden">
        <img
          src="/images/site/IMG_20220124_115907.jpg"
          alt="Allestimento di matrimonio curato da Errevento"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="relative mx-auto max-w-2xl px-5 pt-24 pb-16 text-center lg:px-8">
          <Eyebrow className="reveal !text-background/80">Wedding planner</Eyebrow>
          <h1 className="display-lg reveal mt-5 text-background">
            Voi pensate al «sì»
            <br />
            <em className="font-light italic">al resto pensiamo noi</em>
          </h1>
          <p className="reveal mx-auto mt-7 max-w-lg text-[15px] leading-relaxed text-background/85">
            Un unico punto di riferimento dal primo incontro all'ultimo brindisi:
            organizzazione, stile e presenza sul posto nel giorno del matrimonio.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <h2 className="display-lg reveal text-ink">
              Organizzare un matrimonio
              <br />
              <em className="font-light italic">dovrebbe essere bello</em>
            </h2>
            <Ornament className="reveal mt-6 justify-start" />
            <div className="reveal mt-8 space-y-5 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                Dopo venticinque anni di feste sappiamo dove nascono gli imprevisti e come
                evitarli. Ci occupiamo dei tempi, dei fornitori e dei mille dettagli che
                rischiano di rubarvi i mesi più belli.
              </p>
              <p>
                Potete affidarci tutto il percorso oppure soltanto una parte: coordinati
                cartacei, allestimenti o la regia del giorno. Il preventivo è sempre su
                misura del servizio scelto.
              </p>
            </div>
          </div>
          <div className="reveal overflow-hidden">
            <img
              src="/images/site/copy-space-envelope-save-the-date-wedding-concept_2.jpg"
              alt="Partecipazioni di matrimonio"
              loading="lazy"
              className="aspect-4/5 w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-blush/45 py-24 lg:py-32">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
          <SectionHeading
            eyebrow="Il servizio"
            title="Cosa comprende"
            intro="Scegliete il pacchetto completo o solo le voci che vi servono."
          />
          <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((item, index) => (
              <div
                key={item.title}
                className="reveal border-t border-border pt-7 text-center"
                style={{ transitionDelay: `${(index % 3) * 90}ms` }}
              >
                <h3 className="font-display text-[22px] text-ink">{item.title}</h3>
                <p className="mx-auto mt-3 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
        <SectionHeading eyebrow="Il percorso" title="Come vi accompagniamo" />
        <div className="mx-auto mt-16 max-w-3xl">
          {PATH.map((step, index) => (
            <div
              key={step.n}
              className="reveal grid gap-4 border-t border-border py-9 sm:grid-cols-[90px_1fr] sm:gap-10"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <p className="font-display text-3xl text-gold">{step.n}</p>
              <div>
                <h3 className="font-display text-[22px] text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-blush/45 py-24 lg:py-32">
        <div className="mx-auto max-w-2xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Primo incontro"
            title="Fissiamo una chiacchierata"
            intro="Raccontateci data e idee: vi ricontattiamo in chat per fissare l'appuntamento in negozio."
          />
          <div className="reveal mt-12 border border-border bg-card px-6 py-10 sm:px-10">
            <InquiryForm source="wedding-planner" defaultEventType="Matrimonio" />
          </div>
        </div>
      </section>
    </>
  );
}

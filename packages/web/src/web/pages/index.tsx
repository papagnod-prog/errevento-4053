import { Link } from "wouter";
import { ArrowRight, Gem, HeartHandshake, Sparkles } from "lucide-react";
import { useFeaturedProducts } from "../queries/catalog";
import { ProductCard, ProductCardSkeleton } from "../components/product-card";
import { ButtonLink, Eyebrow, Ornament, SectionHeading } from "../components/ui/bits";
import { useReveal } from "../hooks/use-reveal";
import { SITE, WORLDS } from "../lib/site";

const VALUES = [
  {
    icon: Sparkles,
    title: "Ricerca continua",
    text: "Selezioniamo novità e tendenze del settore, stagione dopo stagione.",
  },
  {
    icon: HeartHandshake,
    title: "Ascolto del dettaglio",
    text: "Ogni desiderio diventa un progetto: parliamo, proviamo, personalizziamo.",
  },
  {
    icon: Gem,
    title: "Artigianalità",
    text: "Confezioni, incisioni e coordinati realizzati a mano nel nostro laboratorio.",
  },
];

function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-blush pt-24">
      <img
        src="/images/site/wedding-gift-for-guest-scaled-e1643568794210.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blush/60 via-blush/30 to-background" />
      <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <Eyebrow className="reveal">Corato — dal {SITE.since}</Eyebrow>
        <h1 className="display-xl reveal mt-7 text-ink" style={{ transitionDelay: "80ms" }}>
          Il vostro giorno,
          <br />
          <em className="font-light italic">curato nel dettaglio</em>
        </h1>
        <Ornament className="reveal mt-9" />
        <p
          className="reveal mx-auto mt-8 max-w-xl text-[16px] leading-relaxed text-ink/70"
          style={{ transitionDelay: "160ms" }}
        >
          Bomboniere, partecipazioni, confettate e allestimenti su misura. Sfogliate il
          nostro catalogo di oltre 750 articoli e raccontateci il vostro evento.
        </p>
        <div
          className="reveal mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ transitionDelay: "240ms" }}
        >
          <ButtonLink to="/catalogo" variant="solid">
            Sfoglia il catalogo
          </ButtonLink>
          <ButtonLink to="/contatti" variant="outline">
            Fissa un appuntamento
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function Worlds() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
      <SectionHeading
        eyebrow="Le nostre collezioni"
        title="Tre mondi, un solo racconto"
        intro="Ogni ricorrenza ha il suo linguaggio. Scegliete da dove partire: al resto pensiamo insieme."
      />
      <div className="mt-16 grid gap-10 md:grid-cols-3">
        {WORLDS.map((world, index) => (
          <Link
            key={world.slug}
            to={`/catalogo?categoria=${world.slug}`}
            className="reveal group block"
            style={{ transitionDelay: `${index * 110}ms` }}
          >
            <div className="overflow-hidden bg-muted">
              <div className="aspect-3/4 w-full">
                <img
                  src={world.image}
                  alt={world.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </div>
            </div>
            <h3 className="mt-7 text-center font-display text-[26px] text-ink transition-colors group-hover:text-accent">
              {world.title}
            </h3>
            <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
              {world.description}
            </p>
            <span className="mt-5 flex items-center justify-center gap-2 font-body text-[10px] uppercase tracking-[0.24em] text-accent">
              Vedi gli articoli
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1"
                strokeWidth={1.4}
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Featured() {
  const featured = useFeaturedProducts(8);

  return (
    <section className="border-y border-border bg-blush/40 py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <SectionHeading
          eyebrow="Dal catalogo"
          title="Le nostre proposte del momento"
          intro="Una piccola selezione. In negozio e nel catalogo online trovate oltre 750 articoli."
        />
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4 lg:gap-x-10">
          {featured.isLoading
            ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
            : (featured.data ?? []).map((product, index) => (
                <div
                  key={product.id}
                  className="reveal"
                  style={{ transitionDelay: `${(index % 4) * 90}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
        <div className="reveal mt-16 text-center">
          <ButtonLink to="/catalogo" variant="outline">
            Tutto il catalogo
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function Values() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
      <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="reveal relative">
          <div className="overflow-hidden">
            <img
              src="/images/site/IMG_20220124_115907.jpg"
              alt="Allestimento realizzato da Errevento"
              loading="lazy"
              className="aspect-4/5 w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -right-4 hidden w-40 border-8 border-background lg:block">
            <img
              src="/images/site/IMG_20220128_190222.jpg"
              alt=""
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>
        <div>
          <Eyebrow className="reveal">La nostra storia</Eyebrow>
          <h2 className="display-lg reveal mt-5 text-ink">
            Dal {SITE.since} accanto
            <br />
            alle vostre feste
          </h2>
          <Ornament className="reveal mt-6 justify-start" />
          <p className="reveal mt-8 text-[15px] leading-relaxed text-muted-foreground">
            Ascoltare ogni richiesta, ogni desiderio del cliente e trasformarlo in realtà,
            aggiungendo un pizzico di esperienza, di fantasia e quel tocco che personalizza
            ogni evento.
          </p>
          <div className="mt-12 space-y-8">
            {VALUES.map((value, index) => (
              <div
                key={value.title}
                className="reveal flex gap-5"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <value.icon className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.2} />
                <div>
                  <h3 className="font-display text-xl text-ink">{value.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {value.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal mt-12">
            <ButtonLink to="/chi-siamo" variant="outline">
              Conosciamoci
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function WeddingBanner() {
  return (
    <section className="relative overflow-hidden">
      <img
        src="/images/site/Allestimenti.jpg"
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/55" />
      <div className="relative mx-auto max-w-2xl px-6 py-28 text-center lg:py-36">
        <Eyebrow className="reveal !text-background/70">Wedding planner</Eyebrow>
        <h2 className="display-lg reveal mt-6 text-background">
          Pianifichiamo le vostre nozze,
          <br />
          <em className="font-light italic">dal primo sì all'ultimo brindisi</em>
        </h2>
        <p className="reveal mx-auto mt-7 max-w-lg text-[15px] leading-relaxed text-background/80">
          Un unico riferimento per fornitori, tempi, coordinati e allestimenti. Raccontateci
          come immaginate quel giorno.
        </p>
        <div className="reveal mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ButtonLink to="/wedding-planner" variant="light">
            Il nostro percorso
          </ButtonLink>
          <ButtonLink to="/contatti" variant="light" className="border-transparent underline-offset-4">
            Parliamone
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function VisitUs() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
      <SectionHeading
        eyebrow="Vi aspettiamo"
        title="Venite a vedere dal vivo"
        intro="Il catalogo online è una vetrina: in negozio troverete materiali, campioni e tutte le personalizzazioni possibili."
      />
      <div className="reveal mt-14 grid gap-10 text-center sm:grid-cols-3">
        <div>
          <p className="eyebrow">Indirizzo</p>
          <p className="mt-4 font-display text-xl text-ink">{SITE.address}</p>
          <p className="text-sm text-muted-foreground">{SITE.city}</p>
        </div>
        <div>
          <p className="eyebrow">Telefono</p>
          <a href={SITE.phoneHref} className="mt-4 block font-display text-xl text-ink">
            {SITE.phone}
          </a>
          <p className="text-sm text-muted-foreground">Anche su WhatsApp</p>
        </div>
        <div>
          <p className="eyebrow">Email</p>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-4 block font-display text-xl text-ink"
          >
            {SITE.email}
          </a>
          <p className="text-sm text-muted-foreground">Risposta in 24 ore</p>
        </div>
      </div>
      <div className="reveal mt-14 text-center">
        <ButtonLink to="/contatti" variant="solid">
          Fissa un appuntamento
        </ButtonLink>
      </div>
    </section>
  );
}

function Index() {
  useReveal();

  return (
    <>
      <Hero />
      <Worlds />
      <Featured />
      <Values />
      <WeddingBanner />
      <VisitUs />
    </>
  );
}

export default Index;

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { InquiryForm } from "../components/inquiry-form";
import { Eyebrow, Ornament, SectionHeading } from "../components/ui/bits";
import { useReveal } from "../hooks/use-reveal";
import { useSiteSettings } from "../queries/settings";
import { SITE } from "../lib/site";

export default function ContattiPage() {
  useReveal();
  const settings = useSiteSettings();
  const whatsapp = settings.data?.whatsappNumber ?? "393391299927";
  const email = settings.data?.contactEmail ?? SITE.email;

  return (
    <>
      <section className="bg-blush/60 pb-20 pt-36 lg:pb-28 lg:pt-44">
        <div className="mx-auto max-w-2xl px-5 text-center lg:px-8">
          <Eyebrow className="reveal">Contatti</Eyebrow>
          <h1 className="display-lg reveal mt-5 text-ink">
            Passa a trovarci
            <br />
            <em className="font-light italic">o scrivici due righe</em>
          </h1>
          <Ornament className="reveal mt-7" />
          <p className="reveal mx-auto mt-7 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Il negozio è a Corato, in Via Aldo Moro. Per una consulenza dedicata è meglio
            fissare un appuntamento.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-24 lg:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <div className="reveal space-y-9">
              <div className="flex gap-5">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-accent" strokeWidth={1.3} />
                <div>
                  <p className="eyebrow text-[10px]">Negozio</p>
                  <p className="mt-2 text-[15px] text-ink">{SITE.address}</p>
                  <p className="text-[15px] text-ink">{SITE.city}</p>
                  <a
                    href={SITE.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline mt-2 inline-block text-sm text-accent"
                  >
                    Apri in Google Maps
                  </a>
                </div>
              </div>

              <div className="flex gap-5">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-accent" strokeWidth={1.3} />
                <div>
                  <p className="eyebrow text-[10px]">Telefono</p>
                  <a
                    href={SITE.phoneHref}
                    className="link-underline mt-2 inline-block text-[15px] text-ink"
                  >
                    {SITE.phone}
                  </a>
                </div>
              </div>

              <div className="flex gap-5">
                <SiWhatsapp className="mt-1 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p className="eyebrow text-[10px]">WhatsApp</p>
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline mt-2 inline-block text-[15px] text-ink"
                  >
                    Scrivici in chat
                  </a>
                </div>
              </div>

              <div className="flex gap-5">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-accent" strokeWidth={1.3} />
                <div>
                  <p className="eyebrow text-[10px]">Email</p>
                  <a
                    href={`mailto:${email}`}
                    className="link-underline mt-2 inline-block text-[15px] text-ink"
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex gap-5">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-accent" strokeWidth={1.3} />
                <div>
                  <p className="eyebrow text-[10px]">Orari</p>
                  <ul className="mt-2 space-y-1.5">
                    {SITE.hours.map((row) => (
                      <li key={row.days} className="text-sm text-muted-foreground">
                        <span className="text-ink">{row.days}</span> · {row.time}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <p className="reveal mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
              {SITE.legalName} · P.IVA {SITE.vat}
            </p>
          </div>

          <div className="reveal border border-border bg-card px-6 py-10 sm:px-10">
            <div className="text-center">
              <h2 className="font-display text-3xl text-ink">Scrivici</h2>
              <Ornament className="mt-4" />
              <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Compila i campi: apriamo la chat WhatsApp con il messaggio già pronto da
                inviare.
              </p>
            </div>
            <div className="mt-8">
              <InquiryForm source="contatti" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <SectionHeading
          className="px-5 pt-24 pb-4 lg:pt-32"
          eyebrow="Dove siamo"
          title="Via Aldo Moro 97, Corato"
        />
        <div className="mx-auto max-w-[1240px] px-5 pb-24 lg:px-8 lg:pb-32">
          <div className="reveal mt-10 overflow-hidden border border-border">
            <iframe
              title="Mappa di Errevento a Corato"
              src="https://www.google.com/maps?q=Via%20Aldo%20Moro%2097,%2070033%20Corato%20BA&output=embed"
              className="h-[380px] w-full lg:h-[460px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}

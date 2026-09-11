export const SITE = {
  name: "Errevento",
  legalName: "Errevento di Rossella Ferrucci",
  since: 1999,
  tagline: "Bomboniere, partecipazioni e allestimenti",
  address: "Via Aldo Moro 97",
  city: "70033 Corato (BA)",
  phone: "+39 339 129 9927",
  phoneHref: "tel:+393391299927",
  email: "info@errevento.it",
  vat: "05656120721",
  mapsUrl: "https://maps.google.com/?q=Via+Aldo+Moro+97,+70033+Corato+BA",
  hours: [
    { days: "Lunedì — Venerdì", time: "9:30 — 13:00 / 16:30 — 20:00" },
    { days: "Sabato", time: "9:30 — 13:00 / 16:30 — 20:30" },
    { days: "Domenica", time: "su appuntamento" },
  ],
} as const;

export const NAV = [
  { label: "Catalogo", href: "/catalogo" },
  { label: "Allestimenti", href: "/allestimenti" },
  { label: "Wedding Planner", href: "/wedding-planner" },
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Contatti", href: "/contatti" },
] as const;

export const EVENT_TYPES = [
  "Matrimonio",
  "Battesimo",
  "Comunione",
  "Cresima",
  "Diciottesimo",
  "Laurea",
  "Nascita",
  "Anniversario",
  "Compleanno",
  "Altro",
] as const;

/** I quattro mondi mostrati in home */
export const WORLDS = [
  {
    slug: "bomboniere",
    title: "Bomboniere",
    description:
      "Un pensiero che resta: ceramiche, oggetti d'arredo, sacchetti e scatoline per ogni ricorrenza.",
    image: "/images/site/wedding-gift-for-guest-scaled-e1643568794210.jpg",
  },
  {
    slug: "partecipazioni",
    title: "Partecipazioni & Inviti",
    description:
      "Carta, stampa e parole scelte con cura per annunciare il vostro giorno.",
    image: "/images/site/copy-space-envelope-save-the-date-wedding-concept_2.jpg",
  },
  {
    slug: "confettate",
    title: "Confettate",
    description:
      "Tavoli dolci, segnaposto e contenitori coordinati per accogliere gli ospiti.",
    image: "/images/site/white-sugared-almonds-on-glasses-and-gift-boxes-scaled.jpg",
  },
] as const;

export const ALLESTIMENTI = [
  {
    title: "Matrimonio",
    text: "Cerimonia, ricevimento e angoli fotografici coordinati, dal bouquet ai centrotavola.",
    image: "/images/site/IMG_20220124_115907.jpg",
  },
  {
    title: "18 anni",
    text: "Scenografie moderne, palloncini, luci e coordinati su misura per la festa.",
    image: "/images/site/IMG_20220124_190624.jpg",
  },
  {
    title: "Comunione",
    text: "Allestimenti delicati per la chiesa e per la casa, con dettagli personalizzati.",
    image: "/images/site/IMG_20220124_190515.jpg",
  },
  {
    title: "Battesimo",
    text: "Colori tenui, nuvole, nomi e coordinati per accogliere chi arriva.",
    image: "/images/site/IMG_20220128_190300.jpg",
  },
  {
    title: "Primo compleanno",
    text: "Smash cake, sweet table e fondali a tema per il primo grande giorno.",
    image: "/images/site/IMG_20220128_190222.jpg",
  },
  {
    title: "Nascita",
    text: "Fiocchi, coccarde e decorazioni per la casa e l'ingresso.",
    image: "/images/site/Allestimenti.jpg",
  },
] as const;

export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

export function categoryLabel(slugs: string) {
  const first = slugs.split(",").filter(Boolean)[0];
  if (!first) return "";
  return first
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

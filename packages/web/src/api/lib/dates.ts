/**
 * Date in fuso Europe/Rome, espresse come stringhe YYYY-MM-DD.
 * Tutte le statistiche del pannello ragionano su queste stringhe: i mesi
 * coincidono col calendario italiano e non serve gestire l'ora legale.
 */

const DAY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-08-18" per la data indicata, letta a Roma. */
export function romeDay(date: Date = new Date()) {
  return DAY_FORMAT.format(date);
}

/** Somma (o sottrae) giorni a una stringa YYYY-MM-DD. */
export function addDays(day: string, amount: number) {
  const base = new Date(`${day}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + amount);
  return base.toISOString().slice(0, 10);
}

/** Primo giorno del mese di `day`. */
export function startOfMonth(day: string) {
  return `${day.slice(0, 7)}-01`;
}

/** Ultimo giorno del mese di `day`. */
export function endOfMonth(day: string) {
  const [year, month] = day.split("-").map(Number);
  const last = new Date(Date.UTC(year, month, 0));
  return last.toISOString().slice(0, 10);
}

/** Sposta di `amount` mesi restando sul primo giorno. */
export function addMonths(day: string, amount: number) {
  const [year, month] = day.split("-").map(Number);
  const moved = new Date(Date.UTC(year, month - 1 + amount, 1));
  return moved.toISOString().slice(0, 10);
}

export type Period = {
  /** primo giorno incluso */
  from: string;
  /** ultimo giorno incluso */
  to: string;
  label: string;
  /** periodo precedente di pari durata, per il confronto */
  previous: { from: string; to: string; label: string };
};

const MONTHS = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

function monthLabel(day: string) {
  const [year, month] = day.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

export type PeriodPreset = "mese-corrente" | "mese-scorso" | "ultimi-30" | "anno" | "sempre";

/** Traduce il selettore del pannello in un intervallo di giorni + quello precedente. */
export function resolvePeriod(preset: PeriodPreset, today = romeDay()): Period {
  if (preset === "mese-corrente") {
    const from = startOfMonth(today);
    const prevFrom = addMonths(from, -1);
    return {
      from,
      to: today,
      label: monthLabel(from),
      previous: { from: prevFrom, to: endOfMonth(prevFrom), label: monthLabel(prevFrom) },
    };
  }

  if (preset === "mese-scorso") {
    const from = addMonths(startOfMonth(today), -1);
    const prevFrom = addMonths(from, -1);
    return {
      from,
      to: endOfMonth(from),
      label: monthLabel(from),
      previous: { from: prevFrom, to: endOfMonth(prevFrom), label: monthLabel(prevFrom) },
    };
  }

  if (preset === "ultimi-30") {
    const from = addDays(today, -29);
    return {
      from,
      to: today,
      label: "ultimi 30 giorni",
      previous: {
        from: addDays(from, -30),
        to: addDays(from, -1),
        label: "30 giorni precedenti",
      },
    };
  }

  if (preset === "anno") {
    const year = today.slice(0, 4);
    const from = `${year}-01-01`;
    const prevYear = String(Number(year) - 1);
    return {
      from,
      to: today,
      label: `anno ${year}`,
      previous: { from: `${prevYear}-01-01`, to: `${prevYear}-12-31`, label: `anno ${prevYear}` },
    };
  }

  return {
    from: "2000-01-01",
    to: today,
    label: "dall'inizio",
    previous: { from: "2000-01-01", to: "2000-01-01", label: "—" },
  };
}

/**
 * Limite di richieste per indirizzo IP, tenuto in memoria.
 *
 * Il sito gira come un solo processo (systemd, una istanza): una mappa in
 * memoria basta e non aggiunge dipendenze. Al riavvio i contatori si azzerano,
 * comportamento accettabile perché servono a fermare i bot, non a contabilizzare.
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Map<string, Hit>>();

/** Pulizia periodica: evita che la mappa cresca con IP che non tornano più. */
function sweep(bucket: Map<string, Hit>, now: number) {
  for (const [key, hit] of bucket) {
    if (hit.resetAt <= now) bucket.delete(key);
  }
}

export type LimitResult = {
  /** true quando la richiesta è entro il limite */
  ok: boolean;
  /** secondi da attendere prima di riprovare */
  retryAfter: number;
};

/**
 * Registra un tentativo e dice se è consentito.
 *
 * @param name    nome del limite (es. "api", "inquiry-hour")
 * @param key     chiave del chiamante, di norma l'IP
 * @param max     tentativi consentiti nella finestra
 * @param windowMs durata della finestra in millisecondi
 */
export function hit(name: string, key: string, max: number, windowMs: number): LimitResult {
  const now = Date.now();
  let bucket = buckets.get(name);
  if (!bucket) {
    bucket = new Map();
    buckets.set(name, bucket);
  }
  if (bucket.size > 5000) sweep(bucket, now);

  const current = bucket.get(key);
  if (!current || current.resetAt <= now) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count > max) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Quanti tentativi restano, senza registrarne uno nuovo. */
export function peek(name: string, key: string, max: number) {
  const current = buckets.get(name)?.get(key);
  if (!current || current.resetAt <= Date.now()) return max;
  return Math.max(0, max - current.count);
}

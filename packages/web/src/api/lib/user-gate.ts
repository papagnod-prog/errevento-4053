import { APIError } from "better-auth/api";

/**
 * La registrazione pubblica è chiusa: gli account del pannello si creano solo
 * dalle procedure server (bootstrap del primo admin o "Utenti" nel pannello).
 * Il flag vale solo per la durata della chiamata, nello stesso processo.
 */
let allowed = false;

export async function withUserCreation<T>(fn: () => Promise<T>): Promise<T> {
  allowed = true;
  try {
    return await fn();
  } finally {
    allowed = false;
  }
}

export function assertUserCreationAllowed() {
  if (!allowed) {
    throw new APIError("FORBIDDEN", {
      message: "La registrazione non è disponibile.",
    });
  }
}

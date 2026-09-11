import { createAuthClient } from "better-auth/react";

const TOKEN_KEY = "errevento_admin_token";

/**
 * Sessione via bearer token in localStorage: funziona anche quando il sito
 * gira dentro un iframe di anteprima, dove i cookie di terze parti sono bloccati.
 */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage non disponibile: si continua con i cookie
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // niente da fare
  }
}

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
  fetchOptions: {
    auth: { type: "Bearer", token: () => getToken() },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) setToken(token);
    },
  },
});

export async function signOut() {
  try {
    await authClient.signOut();
  } finally {
    clearToken();
  }
}

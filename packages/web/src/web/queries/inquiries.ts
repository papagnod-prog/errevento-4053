import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Salva la richiesta e restituisce il link WhatsApp precompilato */
export function useCreateInquiry() {
  return useMutation(orpc.inquiries.create.mutationOptions());
}

/**
 * Gettone chiesto all'apertura del modulo: viaggia con l'invio e permette al
 * server di riconoscere le compilazioni istantanee dei programmi automatici.
 */
export function useFormToken(enabled = true) {
  return useQuery(
    orpc.inquiries.formToken.queryOptions({
      enabled,
      staleTime: 60_000,
      gcTime: 0,
      retry: 1,
    }),
  );
}

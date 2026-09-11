import { useMutation } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Salva la richiesta e restituisce il link WhatsApp precompilato */
export function useCreateInquiry() {
  return useMutation(orpc.inquiries.create.mutationOptions());
}

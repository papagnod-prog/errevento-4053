import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useSiteSettings() {
  return useQuery(orpc.settings.get.queryOptions({ staleTime: 60_000 }));
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.settings.update.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.settings.key() }),
    }),
  );
}

export function useAdminInquiries(enabled: boolean) {
  return useQuery(
    orpc.settings.inquiries.queryOptions({ enabled, staleTime: 10_000 }),
  );
}

export function useDeleteInquiry() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.settings.deleteInquiry.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.settings.key() }),
    }),
  );
}

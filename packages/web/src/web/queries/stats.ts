import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export type StatsPreset = "mese-corrente" | "mese-scorso" | "ultimi-30" | "anno" | "sempre";

export function useStatsOverview(preset: StatsPreset, enabled: boolean) {
  return useQuery(
    orpc.stats.overview.queryOptions({
      input: { preset },
      enabled,
      staleTime: 30_000,
    }),
  );
}

export function useSetLeadRate() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.stats.setLeadRate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.stats.key() });
      },
    }),
  );
}

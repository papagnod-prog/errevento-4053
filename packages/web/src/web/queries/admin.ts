import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/* ---------- prodotti ---------- */

export type AdminProductFilters = {
  search: string;
  categoryId: number | null;
  sort: "recenti" | "nome" | "ordine";
  page: number;
};

export function useAdminProducts(filters: AdminProductFilters, enabled: boolean) {
  return useQuery(
    orpc.adminProducts.list.queryOptions({
      input: { ...filters, pageSize: 20 },
      enabled,
      staleTime: 5_000,
    }),
  );
}

export function useAdminProduct(id: number | null) {
  return useQuery(
    orpc.adminProducts.get.queryOptions({
      input: { id: id ?? 0 },
      enabled: id !== null,
    }),
  );
}

function useCatalogInvalidator() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.adminProducts.key() });
    queryClient.invalidateQueries({ queryKey: orpc.adminCategories.key() });
    queryClient.invalidateQueries({ queryKey: orpc.catalog.key() });
  };
}

export function useSaveProduct() {
  const invalidate = useCatalogInvalidator();
  return useMutation(orpc.adminProducts.save.mutationOptions({ onSuccess: invalidate }));
}

export function useDeleteProduct() {
  const invalidate = useCatalogInvalidator();
  return useMutation(orpc.adminProducts.remove.mutationOptions({ onSuccess: invalidate }));
}

export function useToggleFeatured() {
  const invalidate = useCatalogInvalidator();
  return useMutation(
    orpc.adminProducts.toggleFeatured.mutationOptions({ onSuccess: invalidate }),
  );
}

/* ---------- categorie ---------- */

export function useAdminCategories(enabled: boolean) {
  return useQuery(
    orpc.adminCategories.list.queryOptions({ enabled, staleTime: 10_000 }),
  );
}

export function useSaveCategory() {
  const invalidate = useCatalogInvalidator();
  return useMutation(orpc.adminCategories.save.mutationOptions({ onSuccess: invalidate }));
}

export function useDeleteCategory() {
  const invalidate = useCatalogInvalidator();
  return useMutation(
    orpc.adminCategories.remove.mutationOptions({ onSuccess: invalidate }),
  );
}

/* ---------- utenti ---------- */

export function useNeedsSetup() {
  return useQuery(orpc.adminUsers.needsSetup.queryOptions({ staleTime: 30_000 }));
}

export function useSetupFirstUser() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.adminUsers.setup.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: orpc.adminUsers.key() }),
    }),
  );
}

export function useAdminUsers(enabled: boolean) {
  return useQuery(orpc.adminUsers.list.queryOptions({ enabled, staleTime: 10_000 }));
}

function useUsersInvalidator() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: orpc.adminUsers.key() });
}

export function useCreateUser() {
  const invalidate = useUsersInvalidator();
  return useMutation(orpc.adminUsers.create.mutationOptions({ onSuccess: invalidate }));
}

export function useDeleteUser() {
  const invalidate = useUsersInvalidator();
  return useMutation(orpc.adminUsers.remove.mutationOptions({ onSuccess: invalidate }));
}

export function useSetUserPassword() {
  return useMutation(orpc.adminUsers.setPassword.mutationOptions());
}

export function useRenameUser() {
  const invalidate = useUsersInvalidator();
  return useMutation(orpc.adminUsers.rename.mutationOptions({ onSuccess: invalidate }));
}

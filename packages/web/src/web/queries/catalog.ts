import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export type CatalogSort = "default" | "name-asc" | "price-asc" | "price-desc";

export function useCategories() {
  return useQuery(orpc.catalog.categories.queryOptions({ staleTime: 5 * 60_000 }));
}

export function useProducts(params: {
  category?: string;
  search?: string;
  sort: CatalogSort;
  page: number;
  pageSize?: number;
}) {
  return useQuery(
    orpc.catalog.list.queryOptions({
      input: {
        category: params.category,
        search: params.search,
        sort: params.sort,
        page: params.page,
        pageSize: params.pageSize ?? 24,
      },
      staleTime: 60_000,
    }),
  );
}

export function useFeaturedProducts(limit = 8) {
  return useQuery(
    orpc.catalog.featured.queryOptions({ input: { limit }, staleTime: 5 * 60_000 }),
  );
}

export function useProduct(slug: string) {
  return useQuery(
    orpc.catalog.product.queryOptions({
      input: { slug },
      staleTime: 60_000,
      retry: false,
    }),
  );
}

export function useCategoryPreviews(slugs: string[]) {
  return useQuery(
    orpc.catalog.categoryPreviews.queryOptions({
      input: { slugs },
      staleTime: 5 * 60_000,
    }),
  );
}

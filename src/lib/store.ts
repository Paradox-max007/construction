"use client";

import { create } from "zustand";
import type { SortOption } from "@/lib/types";

export type View = "home" | "browse" | "detail" | "compare";

interface MarketplaceState {
  // navigation
  view: View;
  // browse filters
  categorySlug: string | null;
  search: string;
  sort: SortOption;
  minRating: number;
  verifiedOnly: boolean;
  premiumOnly: boolean;
  area: string;
  page: number;
  // detail
  selectedSlug: string | null;
  // compare
  compareIds: string[];
  // dialogs
  quoteProvider: { id: string; name: string } | null;
  reviewProvider: { id: string; name: string } | null;
  // mobile filter sheet
  filtersOpen: boolean;

  // actions
  goHome: () => void;
  goBrowse: (opts?: Partial<Pick<MarketplaceState, "categorySlug" | "search" | "sort" | "minRating" | "verifiedOnly" | "premiumOnly" | "area" | "page">>) => void;
  openProvider: (slug: string) => void;
  openCompare: () => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  setSort: (s: SortOption) => void;
  setMinRating: (n: number) => void;
  toggleVerified: () => void;
  togglePremium: () => void;
  setArea: (a: string) => void;
  setSearch: (s: string) => void;
  setPage: (p: number) => void;
  setCategory: (slug: string | null) => void;
  openQuote: (id: string, name: string) => void;
  closeQuote: () => void;
  openReview: (id: string, name: string) => void;
  closeReview: () => void;
  setFiltersOpen: (open: boolean) => void;
}

function scrollTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export const useMarketplace = create<MarketplaceState>((set) => ({
  view: "home",
  categorySlug: null,
  search: "",
  sort: "rating",
  minRating: 0,
  verifiedOnly: false,
  premiumOnly: false,
  area: "",
  page: 1,
  selectedSlug: null,
  compareIds: [],
  quoteProvider: null,
  reviewProvider: null,
  filtersOpen: false,

  goHome: () => {
    set({ view: "home", selectedSlug: null });
    scrollTop();
  },
  goBrowse: (opts) => {
    set((s) => ({
      view: "browse",
      page: 1,
      categorySlug: opts?.categorySlug !== undefined ? opts.categorySlug : s.categorySlug,
      search: opts?.search !== undefined ? opts.search : s.search,
      sort: opts?.sort ?? s.sort,
      minRating: opts?.minRating ?? s.minRating,
      verifiedOnly: opts?.verifiedOnly ?? s.verifiedOnly,
      premiumOnly: opts?.premiumOnly ?? s.premiumOnly,
      area: opts?.area ?? s.area,
    }));
    scrollTop();
  },
  openProvider: (slug) => {
    set({ view: "detail", selectedSlug: slug });
    scrollTop();
  },
  openCompare: () => {
    set({ view: "compare" });
    scrollTop();
  },
  toggleCompare: (id) => {
    set((s) => {
      const exists = s.compareIds.includes(id);
      if (exists) return { compareIds: s.compareIds.filter((x) => x !== id) };
      if (s.compareIds.length >= 3) return s; // max 3
      return { compareIds: [...s.compareIds, id] };
    });
  },
  clearCompare: () => set({ compareIds: [] }),
  setSort: (sort) => set({ sort, page: 1 }),
  setMinRating: (n) => set({ minRating: n, page: 1 }),
  toggleVerified: () => set((s) => ({ verifiedOnly: !s.verifiedOnly, page: 1 })),
  togglePremium: () => set((s) => ({ premiumOnly: !s.premiumOnly, page: 1 })),
  setArea: (area) => set({ area, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => {
    set({ page });
    scrollTop();
  },
  setCategory: (slug) => set({ categorySlug: slug, page: 1 }),
  openQuote: (id, name) => set({ quoteProvider: { id, name } }),
  closeQuote: () => set({ quoteProvider: null }),
  openReview: (id, name) => set({ reviewProvider: { id, name } }),
  closeReview: () => set({ reviewProvider: null }),
  setFiltersOpen: (open) => set({ filtersOpen: open }),
}));

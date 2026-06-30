"use client";

import { create } from "zustand";
import type { SortOption, AuthUser, CustomerUser, AdminUser } from "@/lib/types";

export type View =
  | "home"
  | "browse"
  | "detail"
  | "compare"
  | "page" // generic info page
  | "dashboard"
  | "onboarding"
  | "login" // unified auth view (customer + provider tabs)
  | "customer-dashboard"
  | "admin-dashboard";

// Static content pages rendered by the InfoPage component.
export type PageType =
  | "how-it-works"
  | "pricing-guide"
  | "help-center"
  | "verification"
  | "partner-program"
  | "pricing-plans"
  | "privacy"
  | "terms";

export type DashboardTab =
  | "overview"
  | "leads"
  | "portfolio"
  | "profile"
  | "services"
  | "billing"
  | "analytics"
  | "reviews";

export type CustomerDashboardTab = "overview" | "quotes" | "projects" | "profile";

export type LoginRole = "customer" | "provider";

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
  // info page
  pageType: PageType | null;
  // dashboard
  dashboardSlug: string | null;
  dashboardTab: DashboardTab;
  customerDashboardTab: CustomerDashboardTab;
  // auth (3 sessions — independent)
  authUser: AuthUser | null; // provider
  customerUser: CustomerUser | null;
  adminUser: AdminUser | null;
  authLoading: boolean;
  loginRole: LoginRole;
  // dialogs
  quoteProvider: { id: string; name: string } | null;
  reviewProvider: { id: string; name: string } | null;
  // pending action context (quote/review dialog attempted while logged out)
  pendingQuote: { id: string; name: string } | null;
  pendingReview: { id: string; name: string } | null;
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
  // new pages
  openPage: (t: PageType) => void;
  // provider dashboard
  openDashboard: (slug: string, tab?: DashboardTab) => void;
  setDashboardTab: (t: DashboardTab) => void;
  setDashboardSlug: (slug: string) => void;
  openOnboarding: () => void;
  // customer dashboard
  openCustomerDashboard: (tab?: CustomerDashboardTab) => void;
  setCustomerDashboardTab: (t: CustomerDashboardTab) => void;
  setCustomerUser: (u: CustomerUser | null) => void;
  customerLogout: () => void;
  // admin dashboard
  openAdminDashboard: () => void;
  setAdminUser: (u: AdminUser | null) => void;
  adminLogout: () => void;
  // unified auth
  openLogin: () => void; // default role = provider
  openLoginWithRole: (role: LoginRole) => void;
  openCustomerLogin: () => void;
  setLoginRole: (r: LoginRole) => void;
  setAuthUser: (u: AuthUser | null) => void;
  setAuthLoading: (b: boolean) => void;
  logout: () => void; // provider only
  logoutAll: () => void; // all sessions
  // gated actions
  requireDashboard: () => void; // opens provider login if not authed
  requireCustomer: () => void; // opens customer login if not authed
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
  pageType: null,
  dashboardSlug: null,
  dashboardTab: "overview",
  customerDashboardTab: "overview",
  authUser: null,
  customerUser: null,
  adminUser: null,
  authLoading: false,
  loginRole: "customer",
  quoteProvider: null,
  reviewProvider: null,
  pendingQuote: null,
  pendingReview: null,
  filtersOpen: false,

  goHome: () => {
    set({ view: "home", selectedSlug: null, pageType: null });
    scrollTop();
  },
  goBrowse: (opts) => {
    set((s) => ({
      view: "browse",
      page: 1,
      pageType: null,
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
    set({ view: "detail", selectedSlug: slug, pageType: null });
    scrollTop();
  },
  openCompare: () => {
    set({ view: "compare", pageType: null });
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
  // pages
  openPage: (t) => {
    set({ view: "page", pageType: t });
    scrollTop();
  },
  // provider dashboard
  openDashboard: (slug, tab) => {
    set({ view: "dashboard", dashboardSlug: slug, dashboardTab: tab ?? "overview", pageType: null });
    scrollTop();
  },
  setDashboardTab: (t) => {
    set({ dashboardTab: t });
    scrollTop();
  },
  setDashboardSlug: (slug) => set({ dashboardSlug: slug }),
  openOnboarding: () => {
    set({ view: "onboarding", pageType: null });
    scrollTop();
  },
  // customer dashboard
  openCustomerDashboard: (tab) => {
    set({ view: "customer-dashboard", customerDashboardTab: tab ?? "overview", pageType: null });
    scrollTop();
  },
  setCustomerDashboardTab: (t) => {
    set({ customerDashboardTab: t });
    scrollTop();
  },
  setCustomerUser: (u) => set({ customerUser: u }),
  customerLogout: () => {
    set({ customerUser: null, view: "home" });
    scrollTop();
  },
  // admin dashboard
  openAdminDashboard: () => {
    set({ view: "admin-dashboard", pageType: null });
    scrollTop();
  },
  setAdminUser: (u) => set({ adminUser: u }),
  adminLogout: () => {
    set({ adminUser: null, view: "home" });
    scrollTop();
  },
  // unified auth
  openLogin: () => {
    set({ view: "login", loginRole: "provider", pageType: null });
    scrollTop();
  },
  openLoginWithRole: (role) => {
    set({ view: "login", loginRole: role, pageType: null });
    scrollTop();
  },
  openCustomerLogin: () => {
    set({ view: "login", loginRole: "customer", pageType: null });
    scrollTop();
  },
  setLoginRole: (r) => set({ loginRole: r }),
  setAuthUser: (u) => set({ authUser: u }),
  setAuthLoading: (b) => set({ authLoading: b }),
  logout: () => {
    set({ authUser: null, view: "home", dashboardSlug: null });
    scrollTop();
  },
  logoutAll: () => {
    set({
      authUser: null,
      customerUser: null,
      adminUser: null,
      view: "home",
      dashboardSlug: null,
    });
    scrollTop();
  },
  requireDashboard: () => {
    set((s) => {
      if (s.authUser) {
        return { view: "dashboard", dashboardSlug: s.authUser.slug, dashboardTab: "overview", pageType: null };
      }
      return { view: "login", loginRole: "provider", pageType: null };
    });
    scrollTop();
  },
  requireCustomer: () => {
    set((s) => {
      if (s.customerUser) {
        return { view: "customer-dashboard", customerDashboardTab: "overview", pageType: null };
      }
      return { view: "login", loginRole: "customer", pageType: null };
    });
    scrollTop();
  },
}));

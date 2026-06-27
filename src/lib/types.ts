// Frontend types — re-exported from the API serialization layer.
// These mirror exactly what the API routes return.

export type {
  SerializedCategory,
  SerializedProject,
  SerializedReview,
  SerializedProvider,
  ProviderWithCategory,
  ProviderFull,
} from "@/lib/serialize";

import type {
  SerializedProvider,
  ProviderWithCategory,
  ProviderFull,
  SerializedCategory,
  SerializedProject,
  SerializedReview,
} from "@/lib/serialize";

export type Category = SerializedCategory;
export type Project = SerializedProject;
export type Review = SerializedReview;
export type Provider = SerializedProvider;
export type ProviderListItem = ProviderWithCategory;
export type ProviderDetail = ProviderFull;

export type ProviderPackage = {
  name: string;
  price: number;
  priceUnit: string;
  desc: string;
  features: string[];
};

export type About = {
  mission?: string;
  vision?: string;
  usp?: string;
  why?: string[];
};

export type SortOption =
  | "rating"
  | "price_low"
  | "price_high"
  | "experience"
  | "reviews"
  | "newest";

export type ProvidersResponse = {
  providers: ProviderListItem[];
  total: number;
  page: number;
  totalPages: number;
};

export type QuotePayload = {
  providerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  projectType: string;
  budget?: string;
  location?: string;
  timeline?: string;
  message?: string;
};

export type ReviewPayload = {
  providerId: string;
  customerName: string;
  rating: number;
  title?: string;
  review: string;
  projectType?: string;
};

// ---- Dashboard / leads ----

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export type Lead = {
  id: string;
  providerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  projectType: string;
  budget: string | null;
  location: string | null;
  timeline: string | null;
  message: string | null;
  status: LeadStatus;
  createdAt: string;
  provider?: { id: string; companyName: string; slug: string };
};

export type LeadsResponse = {
  quoteRequests: Lead[];
};

// Provider profile update payload (all optional)
export type ProviderUpdatePayload = {
  companyName?: string;
  tagline?: string;
  description?: string;
  about?: Record<string, unknown>;
  services?: string[];
  workingAreas?: string[];
  languages?: string[];
  certificates?: string[];
  experience?: number;
  employees?: number;
  startingPrice?: number;
  priceUnit?: string;
  responseTime?: string;
  officeAddress?: string;
  email?: string;
  phone?: string;
  website?: string;
  packages?: ProviderPackage[];
};

// Onboarding payload (new provider signup)
export type OnboardingPayload = {
  companyName: string;
  categorySlug: string;
  description: string;
  workingAreas: string[];
  services: string[];
  email: string;
  phone: string;
  experience: number;
  startingPrice: number;
  priceUnit: string;
};


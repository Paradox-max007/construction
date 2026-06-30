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
  projectType: string;
  budget?: string;
  location?: string;
  timeline?: string;
  message?: string;
};

export type ReviewPayload = {
  providerId: string;
  rating: number;
  title?: string;
  review: string;
  projectType?: string;
};

// ---- Dashboard / leads ----

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";
export type ProjectStatus = "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled";

export type Lead = {
  id: string;
  providerId: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  projectType: string;
  budget: string | null;
  location: string | null;
  timeline: string | null;
  message: string | null;
  status: LeadStatus;
  projectStatus?: ProjectStatus | null;
  projectNotes?: string | null;
  projectUpdatedAt?: string | null;
  createdAt: string;
  provider?: { id: string; companyName: string; slug: string };
  customer?: { id: string; name: string; email: string; phone: string | null } | null;
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

// Onboarding payload (new provider signup) — now creates a real account
export type OnboardingPayload = {
  companyName: string;
  categorySlug: string;
  description: string;
  email: string;
  phone: string;
  password: string;
  services: string[];
  workingAreas: string[];
  certificates?: string[];
  documentUrls: string[];
  experience: number;
  startingPrice: number;
  priceUnit: string;
  officeAddress?: string;
};

// Auth response shapes
export type AuthUser = {
  slug: string;
  companyName: string;
  email: string | null;
};

export type LoginResponse = {
  success: boolean;
  provider: AuthUser;
};

export type MeResponse = {
  authenticated: boolean;
  provider?: ProviderDetail;
};

// ---- Customer auth ----

export type CustomerUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  googleId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerQuote = {
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
  projectStatus?: ProjectStatus | null;
  projectNotes?: string | null;
  projectUpdatedAt?: string | null;
  createdAt: string;
  provider?: { id: string; companyName: string; slug: string } | null;
};

export type CustomerMeResponse = {
  authenticated: boolean;
  customer?: CustomerUser & {
    quotes?: CustomerQuote[];
  };
};

export type CustomerLoginResponse = {
  success: boolean;
  customer: CustomerUser;
};

// ---- Admin auth ----

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

export type AdminLoginResponse = {
  success: boolean;
  admin: AdminUser;
};

export type AdminMeResponse = {
  authenticated: boolean;
  admin?: AdminUser;
};

// ---- Plans & subscriptions ----

export type Plan = {
  id: string;
  planType: string; // weekly | monthly | yearly
  name: string;
  price: number;
  featuredPrice: number;
  premiumPrice: number;
  bothPrice: number;
  durationDays: number;
  description?: string | null;
  features: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlansResponse = {
  plans: Plan[];
};

export type Subscription = {
  id: string;
  transactionRef: string;
  providerId: string;
  planType: string;
  planName: string;
  amount: number;
  originalAmount: number;
  currency: string;
  durationDays: number;
  featureType: "featured" | "premium" | "both";
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  paymentMethod: string;
  offerCode: string | null;
  offerDiscount: number;
  adminNotes: string | null;
  cancelledBy: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: { id: string; companyName: string; slug: string };
  offerUsage?: { id: string; code: string; discountAmount: number } | null;
};

export type SubscriptionsResponse = {
  subscriptions: Subscription[];
};

export type SubscriptionCreateResponse = {
  success: boolean;
  subscription: Subscription;
};

// ---- Offers ----

export type Offer = {
  id: string;
  code: string;
  description?: string | null;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
};

export type OffersResponse = {
  offers: Offer[];
};

export type OfferValidateResponse = {
  valid: boolean;
  reason?: string;
  code?: string;
  description?: string | null;
  discountType?: "percent" | "fixed";
  discountValue?: number;
  discount?: number;
  finalAmount?: number;
  expiresAt?: string | null;
};

// ---- Admin: stats / providers / customers / leads / revenue ----

export type AdminStatsResponse = {
  stats: {
    providers: number;
    approvedProviders: number;
    pendingApprovals: number;
    pendingVerifications: number;
    customers: number;
    quotes: number;
    newQuotes: number;
    activeSubscriptions: number;
    totalRevenue: number;
    offers: number;
    activeOffers: number;
    plans: number;
    featuredProviders: number;
    premiumProviders: number;
  };
};

export type AdminProvider = {
  id: string;
  companyName: string;
  slug: string;
  email: string | null;
  phone: string | null;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  verified: boolean;
  premium: boolean;
  featured: boolean;
  approved: boolean;
  rating: number;
  reviewsCount: number;
  startingPrice: number;
  experience: number;
  documentUrls: string[];
  certificates: string[];
  createdAt: string;
  updatedAt: string;
  subscriptionCount: number;
  quoteCount: number;
  reviewCount: number;
  planOverrides: { id: string; planType: string; customPrice: number; notes: string | null }[];
};

export type AdminProvidersResponse = {
  providers: AdminProvider[];
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  googleId: string | null;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
  quoteCount: number;
  reviewCount: number;
};

export type AdminCustomersResponse = {
  customers: AdminCustomer[];
};

export type AdminLead = {
  id: string;
  providerId: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  projectType: string;
  budget: string | null;
  location: string | null;
  timeline: string | null;
  message: string | null;
  status: LeadStatus;
  projectStatus: ProjectStatus | null;
  projectNotes: string | null;
  projectUpdatedAt: string | null;
  createdAt: string;
  provider: { id: string; companyName: string; slug: string } | null;
  customer: { id: string; name: string; email: string; phone: string | null } | null;
};

export type AdminLeadsResponse = {
  quoteRequests: AdminLead[];
};

export type RevenueReport = {
  period: "day" | "month" | "year";
  totalSubscriptions: number;
  totalAmount: number;
  totalDiscount: number;
  breakdown: { period: string; count: number; amount: number; discount: number }[];
  byStatus: { status: string; count: number; amount: number }[];
  byFeature: { feature: string; count: number; amount: number }[];
};

export type SubscriberResponse = {
  success: boolean;
  subscriber: { id: string; email: string; name: string | null; createdAt: string };
  message: string;
};

// Provider plan override (admin)
export type ProviderPlanOverride = {
  id: string;
  providerId: string;
  planType: string;
  customPrice: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: { id: string; companyName: string; slug: string };
};

export type ProviderOverridesResponse = {
  overrides: ProviderPlanOverride[];
};

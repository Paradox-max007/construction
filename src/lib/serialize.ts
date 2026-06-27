// Shared serialization helpers for BuildCraft API routes.
// Transforms raw Prisma rows into frontend-friendly shapes by converting
// comma-separated string fields into arrays and parsing JSON columns.

import type {
  Category,
  Project,
  Provider,
  Review,
} from "@prisma/client";

// ---- primitives --------------------------------------------------------

/** Split a comma-separated string into a clean array of trimmed strings. */
function splitCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Safely JSON.parse a string. Returns `null` if parsing fails or input is empty. */
function parseJSONOrNull<T = unknown>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/** Safely JSON.parse into an array. Returns `[]` on failure or non-array. */
function parseJSONArray<T = unknown>(value: string | null | undefined): T[] {
  const parsed = parseJSONOrNull<T>(value);
  if (Array.isArray(parsed)) return parsed;
  return [];
}

// ---- types -------------------------------------------------------------

/** Subset of Category the frontend needs (passed through). */
export type SerializedCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  keywords: string | null;
  sortOrder: number;
  createdAt: string;
};

export type SerializedProject = {
  id: string;
  providerId: string;
  title: string;
  description: string | null;
  category: string | null;
  budget: number | null;
  currency: string;
  area: string | null;
  location: string | null;
  completionDate: string | null;
  durationWeeks: number | null;
  materials: string[];
  images: string[];
  clientName: string | null;
  clientReview: string | null;
  clientRating: number | null;
  tags: string[];
  featured: boolean;
  createdAt: string;
};

export type SerializedReview = {
  id: string;
  providerId: string;
  customerName: string;
  customerAvatar: string | null;
  rating: number;
  title: string | null;
  review: string;
  photos: string[];
  verified: boolean;
  projectType: string | null;
  createdAt: string;
};

/** A provider with its category relation included. */
export type ProviderWithCategory = Omit<
  SerializedProvider,
  "projects" | "reviews"
> & {
  category: Pick<
    Category,
    "id" | "name" | "slug" | "imageUrl" | "icon"
  > | null;
};

/** Full serialized provider (no relations). */
export type SerializedProvider = {
  id: string;
  companyName: string;
  slug: string;
  tagline: string | null;
  description: string;
  about: Record<string, unknown> | null;
  logoUrl: string | null;
  coverUrl: string | null;
  categoryId: string;
  services: string[];
  experience: number;
  employees: number;
  projectsCount: number;
  rating: number;
  reviewsCount: number;
  startingPrice: number;
  currency: string;
  priceUnit: string;
  verified: boolean;
  premium: boolean;
  featured: boolean;
  workingAreas: string[];
  officeAddress: string | null;
  languages: string[];
  responseTime: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  certificates: string[];
  packages: Array<Record<string, unknown>>;
  views: number;
  profileViews: number;
  createdAt: string;
  updatedAt: string;
};

/** Full provider detail including category, projects, reviews. */
export type ProviderFull = SerializedProvider & {
  category: Pick<Category, "id" | "name" | "slug" | "imageUrl" | "icon"> | null;
  projects: SerializedProject[];
  reviews: SerializedReview[];
};

// ---- helpers -----------------------------------------------------------

/**
 * Serializes a raw Provider row (with optional included relations) into the
 * frontend-friendly shape: csv fields → arrays, about/packages parsed.
 *
 * Pass `include` options via the Prisma query — this helper will look for
 * `category`, `projects`, `reviews` on the row and serialize them too.
 */
export function serializeProvider<
  T extends Provider & {
    category?: Category | null;
    projects?: Project[];
    reviews?: Review[];
  },
>(p: T): SerializedProvider & {
  category?: Pick<Category, "id" | "name" | "slug" | "imageUrl" | "icon"> | null;
  projects?: SerializedProject[];
  reviews?: SerializedReview[];
} {
  const base: SerializedProvider = {
    id: p.id,
    companyName: p.companyName,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    about: parseJSONOrNull<Record<string, unknown>>(p.about),
    logoUrl: p.logoUrl,
    coverUrl: p.coverUrl,
    categoryId: p.categoryId,
    services: splitCsv(p.services),
    experience: p.experience,
    employees: p.employees,
    projectsCount: p.projectsCount,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    startingPrice: p.startingPrice,
    currency: p.currency,
    priceUnit: p.priceUnit,
    verified: p.verified,
    premium: p.premium,
    featured: p.featured,
    workingAreas: splitCsv(p.workingAreas),
    officeAddress: p.officeAddress,
    languages: splitCsv(p.languages),
    responseTime: p.responseTime,
    email: p.email,
    phone: p.phone,
    website: p.website,
    certificates: splitCsv(p.certificates),
    packages: parseJSONArray<Record<string, unknown>>(p.packages),
    views: p.views,
    profileViews: p.profileViews,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };

  const result: Record<string, unknown> = { ...base };
  // The included `category` is fetched via Prisma `select` with only a subset
  // of fields ({ id, name, slug, imageUrl, icon }), so we pass it through as-is
  // rather than calling `serializeCategory` (which expects the full Category row).
  if (p.category) {
    result.category = p.category;
  } else if ("category" in p) {
    result.category = null;
  }
  if (p.projects) {
    result.projects = p.projects.map(serializeProject);
  }
  if (p.reviews) {
    result.reviews = p.reviews.map(serializeReview);
  }
  return result as SerializedProvider & {
    category?: Pick<Category, "id" | "name" | "slug" | "imageUrl" | "icon"> | null;
    projects?: SerializedProject[];
    reviews?: SerializedReview[];
  };
}

/** Serialize a Project: csv fields → arrays, images → array, dates → ISO. */
export function serializeProject(pr: Project): SerializedProject {
  return {
    id: pr.id,
    providerId: pr.providerId,
    title: pr.title,
    description: pr.description,
    category: pr.category,
    budget: pr.budget,
    currency: pr.currency,
    area: pr.area,
    location: pr.location,
    completionDate: pr.completionDate ? pr.completionDate.toISOString() : null,
    durationWeeks: pr.durationWeeks,
    materials: splitCsv(pr.materials),
    images: splitCsv(pr.images),
    clientName: pr.clientName,
    clientReview: pr.clientReview,
    clientRating: pr.clientRating,
    tags: splitCsv(pr.tags),
    featured: pr.featured,
    createdAt: pr.createdAt.toISOString(),
  };
}

/** Serialize a Review: split photos csv → array, convert date to ISO. */
export function serializeReview(r: Review): SerializedReview {
  return {
    id: r.id,
    providerId: r.providerId,
    customerName: r.customerName,
    customerAvatar: r.customerAvatar,
    rating: r.rating,
    title: r.title,
    review: r.review,
    photos: splitCsv(r.photos),
    verified: r.verified,
    projectType: r.projectType,
    createdAt: r.createdAt.toISOString(),
  };
}

/** Serialize a Category: pass through as-is, convert date to ISO. */
export function serializeCategory(c: Category): SerializedCategory {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    imageUrl: c.imageUrl,
    keywords: c.keywords,
    sortOrder: c.sortOrder,
    createdAt: c.createdAt.toISOString(),
  };
}

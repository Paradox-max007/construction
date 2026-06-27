"use client";

import { useMemo } from "react";
import { SlidersHorizontal, X, Search, MapPin, Star, BadgeCheck, Crown, ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMarketplace } from "@/lib/store";
import { useApi } from "@/hooks/use-api";
import { ProviderCard, ProviderCardSkeleton } from "./provider-card";
import { CategoryIcon } from "./category-icon";
import type { Category, ProvidersResponse, SortOption } from "@/lib/types";

const SORT_LABELS: { value: SortOption; label: string }[] = [
  { value: "rating", label: "Top rated" },
  { value: "reviews", label: "Most reviewed" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
  { value: "experience", label: "Most experienced" },
  { value: "newest", label: "Recently added" },
];

function FiltersPanel({ categories }: { categories: Category[] }) {
  const s = useMarketplace();
  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Search</Label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={s.search}
            onChange={(e) => s.setSearch(e.target.value)}
            placeholder="Keyword…"
            className="h-9 pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* Category */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</Label>
        <div className="mt-2 flex flex-col gap-1">
          <button
            onClick={() => s.setCategory(null)}
            className={`rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
              !s.categorySlug ? "bg-primary/10 font-semibold text-primary" : "hover:bg-accent"
            }`}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => s.setCategory(c.slug)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                s.categorySlug === c.slug ? "bg-primary/10 font-semibold text-primary" : "hover:bg-accent"
              }`}
            >
              <CategoryIcon name={c.icon} className="h-4 w-4 shrink-0" />
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Location */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</Label>
        <div className="relative mt-2">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={s.area}
            onChange={(e) => s.setArea(e.target.value)}
            placeholder="e.g. Bengaluru"
            className="h-9 pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Min. rating</Label>
          <span className="text-sm font-semibold">{s.minRating > 0 ? `${s.minRating}+ ★` : "Any"}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          <Slider
            value={[s.minRating]}
            min={0}
            max={5}
            step={0.5}
            onValueChange={(v) => s.setMinRating(v[0])}
            className="flex-1"
          />
        </div>
      </div>

      <Separator />

      {/* Toggles */}
      <div className="flex flex-col gap-3">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trust</Label>
        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox checked={s.verifiedOnly} onCheckedChange={() => s.toggleVerified()} />
          <span className="flex items-center gap-1.5 text-sm">
            <BadgeCheck className="h-4 w-4 text-emerald-500" /> Verified only
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox checked={s.premiumOnly} onCheckedChange={() => s.togglePremium()} />
          <span className="flex items-center gap-1.5 text-sm">
            <Crown className="h-4 w-4 text-amber-500" /> Premium partners
          </span>
        </label>
      </div>

      <Separator />

      <Button variant="outline" size="sm" onClick={() => s.goBrowse({ categorySlug: null, search: "", area: "", minRating: 0, verifiedOnly: false, premiumOnly: false, sort: "rating" })}>
        <X className="mr-1 h-3.5 w-3.5" /> Reset filters
      </Button>
    </div>
  );
}

export function BrowseView({ categories }: { categories: Category[] }) {
  const s = useMarketplace();

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (s.categorySlug) p.set("category", s.categorySlug);
    if (s.search.trim()) p.set("search", s.search.trim());
    if (s.area.trim()) p.set("area", s.area.trim());
    if (s.minRating > 0) p.set("minRating", String(s.minRating));
    if (s.verifiedOnly) p.set("verified", "true");
    if (s.premiumOnly) p.set("premium", "true");
    p.set("sort", s.sort);
    p.set("page", String(s.page));
    p.set("limit", "9");
    return p.toString();
  }, [s.categorySlug, s.search, s.area, s.minRating, s.verifiedOnly, s.premiumOnly, s.sort, s.page]);

  const { data, isLoading } = useApi<ProvidersResponse>(`/api/providers?${queryString}`, [queryString]);
  const providers = data?.providers ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const activeCategory = categories.find((c) => c.slug === s.categorySlug);
  const activeFilterCount =
    (s.categorySlug ? 1 : 0) +
    (s.search.trim() ? 1 : 0) +
    (s.area.trim() ? 1 : 0) +
    (s.minRating > 0 ? 1 : 0) +
    (s.verifiedOnly ? 1 : 0) +
    (s.premiumOnly ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {activeCategory ? activeCategory.name : "All providers"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeCategory?.description ?? "Browse verified construction professionals across India."}
        </p>
      </div>

      {/* Mobile filter toggle + sort */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <Button variant="outline" size="sm" onClick={() => s.setFiltersOpen(true)} className="flex-1">
          <SlidersHorizontal className="mr-1 h-4 w-4" /> Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1.5 bg-primary text-primary-foreground">{activeFilterCount}</Badge>
          )}
        </Button>
        <Select value={s.sort} onValueChange={(v) => s.setSort(v as SortOption)}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_LABELS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20">
            <Card className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h2>
              <FiltersPanel categories={categories} />
            </Card>
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{providers.length}</span> of{" "}
              <span className="font-semibold text-foreground">{total}</span> providers
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by</span>
              <Select value={s.sort} onValueChange={(v) => s.setSort(v as SortOption)}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_LABELS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {s.categorySlug && activeCategory && (
                <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                  {activeCategory.name}
                  <button onClick={() => s.setCategory(null)}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {s.search.trim() && (
                <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                  &ldquo;{s.search}&rdquo;
                  <button onClick={() => s.setSearch("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {s.area.trim() && (
                <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                  <MapPin className="h-3 w-3" /> {s.area}
                  <button onClick={() => s.setArea("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {s.minRating > 0 && (
                <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                  {s.minRating}+ ★
                  <button onClick={() => s.setMinRating(0)}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {s.verifiedOnly && (
                <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                  Verified
                  <button onClick={() => s.toggleVerified()}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {s.premiumOnly && (
                <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground">
                  Premium
                  <button onClick={() => s.togglePremium()}><X className="h-3 w-3" /></button>
                </Badge>
              )}
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProviderCardSkeleton key={i} />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <PackageSearch className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No providers found</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try adjusting your filters or search terms. There are thousands of verified pros waiting to help.
              </p>
              <Button
                variant="outline"
                onClick={() => s.goBrowse({ categorySlug: null, search: "", area: "", minRating: 0, verifiedOnly: false, premiumOnly: false, sort: "rating" })}
              >
                Clear all filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {providers.map((p, i) => (
                <ProviderCard key={p.id} provider={p} index={i} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={s.page <= 1}
                onClick={() => s.setPage(s.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  if (totalPages > 7 && Math.abs(pageNum - s.page) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className="px-1 text-muted-foreground">…</span>;
                    }
                    return null;
                  }
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={s.page === pageNum ? "default" : "outline"}
                      className="h-9 w-9 p-0"
                      onClick={() => s.setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={s.page >= totalPages}
                onClick={() => s.setPage(s.page + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={s.filtersOpen} onOpenChange={s.setFiltersOpen}>
        <SheetContent side="left" className="w-[320px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FiltersPanel categories={categories} />
          </div>
          <div className="mt-6">
            <Button className="w-full" onClick={() => s.setFiltersOpen(false)}>
              Show {total} results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

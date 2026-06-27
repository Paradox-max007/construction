"use client";

import Image from "next/image";
import { BadgeCheck, Crown, MapPin, Briefcase, GitCompare, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./star-rating";
import { ProviderLogo } from "./provider-logo";
import { useMarketplace } from "@/lib/store";
import { formatStartingPrice, formatCompact } from "@/lib/format";
import type { ProviderListItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProviderCard({ provider, index = 0 }: { provider: ProviderListItem; index?: number }) {
  const openProvider = useMarketplace((s) => s.openProvider);
  const toggleCompare = useMarketplace((s) => s.toggleCompare);
  const compareIds = useMarketplace((s) => s.compareIds);
  const openQuote = useMarketplace((s) => s.openQuote);

  const inCompare = compareIds.includes(provider.id);

  return (
    <Card
      className="group relative flex flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Cover */}
      <button
        onClick={() => openProvider(provider.slug)}
        className="relative block aspect-[16/9] w-full overflow-hidden"
        aria-label={`View ${provider.companyName}`}
      >
        {provider.coverUrl ? (
          <Image
            src={provider.coverUrl}
            alt={provider.companyName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-200 to-orange-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {provider.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          )}
          {provider.premium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              <Crown className="h-3 w-3" /> Premium
            </span>
          )}
        </div>
        {/* Category chip */}
        {provider.category && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
            {provider.category.name}
          </span>
        )}
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <ProviderLogo name={provider.companyName} size={44} />
          <div className="min-w-0 flex-1">
            <button
              onClick={() => openProvider(provider.slug)}
              className="block truncate text-left text-base font-bold leading-tight hover:text-primary"
            >
              {provider.companyName}
            </button>
            {provider.tagline && (
              <p className="truncate text-xs text-muted-foreground">{provider.tagline}</p>
            )}
          </div>
        </div>

        {/* Rating + reviews */}
        <div className="flex items-center justify-between">
          <StarRating rating={provider.rating} showValue count={provider.reviewsCount} size={15} />
          {provider.responseTime && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {provider.responseTime}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{provider.workingAreas[0] ?? "India"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary" />
            {provider.experience} yrs exp
          </span>
        </div>

        {/* Services */}
        {provider.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {provider.services.slice(0, 3).map((s) => (
              <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground font-normal">
                {s}
              </Badge>
            ))}
            {provider.services.length > 3 && (
              <Badge variant="outline" className="font-normal text-muted-foreground">
                +{provider.services.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Starting</p>
            <p className="text-sm font-bold text-foreground">
              {formatStartingPrice(provider.startingPrice, provider.priceUnit)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatCompact(provider.projectsCount)} projects done
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => openProvider(provider.slug)}
          >
            View Profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={cn(inCompare && "border-primary text-primary")}
            onClick={() => toggleCompare(provider.id)}
            aria-label="Add to compare"
            title="Add to compare"
          >
            <GitCompare className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openQuote(provider.id, provider.companyName)}
          >
            Quote
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ProviderCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <div className="aspect-[16/9] w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-3 animate-pulse rounded bg-muted" />
          <div className="h-3 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-full animate-pulse rounded bg-muted" />
      </div>
    </Card>
  );
}

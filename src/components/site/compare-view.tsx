"use client";

import Image from "next/image";
import {
  Star,
  BadgeCheck,
  Crown,
  MapPin,
  Briefcase,
  Users,
  Building2,
  Clock,
  Wallet,
  Award,
  X,
  ArrowRight,
  GitCompare,
  CheckCircle2,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketplace } from "@/lib/store";
import { useApi } from "@/hooks/use-api";
import { ProviderLogo } from "./provider-logo";
import { StarRating } from "./star-rating";
import { formatCompact, formatStartingPrice } from "@/lib/format";
import type { ProviderListItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type RowDef = {
  label: string;
  icon: React.ElementType;
  render: (p: ProviderListItem) => React.ReactNode;
  best?: (p: ProviderListItem) => number; // higher = better; cell with max is highlighted
  lowerIsBetter?: boolean;
};

export function CompareView() {
  const compareIds = useMarketplace((s) => s.compareIds);
  const clearCompare = useMarketplace((s) => s.clearCompare);
  const toggleCompare = useMarketplace((s) => s.toggleCompare);
  const openProvider = useMarketplace((s) => s.openProvider);
  const openQuote = useMarketplace((s) => s.openQuote);
  const goBrowse = useMarketplace((s) => s.goBrowse);

  const idsParam = compareIds.join(",");
  const { data, isLoading } = useApi<{ providers: ProviderListItem[] }>(
    compareIds.length > 0 ? `/api/compare?ids=${idsParam}` : null,
    [idsParam],
  );
  const providers = data?.providers ?? [];

  const rows: RowDef[] = [
    { label: "Rating", icon: Star, render: (p) => <StarRating rating={p.rating} showValue count={p.reviewsCount} size={14} />, best: (p) => p.rating },
    { label: "Starting price", icon: Wallet, render: (p) => <span className="font-bold">{formatStartingPrice(p.startingPrice, p.priceUnit)}</span>, best: (p) => -p.startingPrice, lowerIsBetter: true },
    { label: "Experience", icon: Briefcase, render: (p) => `${p.experience} years`, best: (p) => p.experience },
    { label: "Projects done", icon: Building2, render: (p) => formatCompact(p.projectsCount), best: (p) => p.projectsCount },
    { label: "Team size", icon: Users, render: (p) => formatCompact(p.employees), best: (p) => p.employees },
    { label: "Response time", icon: Clock, render: (p) => p.responseTime ?? "—" },
    { label: "Primary location", icon: MapPin, render: (p) => p.workingAreas[0] ?? "—" },
    {
      label: "Services",
      icon: CheckCircle2,
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.services.slice(0, 5).map((s) => (
            <Badge key={s} variant="outline" className="font-normal">{s}</Badge>
          ))}
          {p.services.length > 5 && <span className="text-xs text-muted-foreground">+{p.services.length - 5}</span>}
        </div>
      ),
    },
    {
      label: "Certificates",
      icon: Award,
      render: (p) =>
        p.certificates.length ? (
          <div className="flex flex-wrap gap-1">
            {p.certificates.slice(0, 4).map((c) => (
              <Badge key={c} variant="secondary" className="bg-accent font-normal">{c}</Badge>
            ))}
          </div>
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground/40" />
        ),
      best: (p) => p.certificates.length,
    },
    {
      label: "Working areas",
      icon: MapPin,
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.workingAreas.map((a) => (
            <Badge key={a} variant="outline" className="font-normal">{a}</Badge>
          ))}
        </div>
      ),
    },
  ];

  if (compareIds.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <GitCompare className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Your compare list is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add up to 3 providers to compare them side by side on rating, pricing, experience and more.
        </p>
        <Button className="mt-6" onClick={() => goBrowse({})}>
          Browse providers <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Compare</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Side-by-side comparison</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluating {providers.length} provider{providers.length > 1 ? "s" : ""} on the metrics that matter.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={clearCompare}>
          <X className="mr-1 h-4 w-4" /> Clear all
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Loading comparison…</Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[760px] border-collapse">
              <tbody>
                {/* Header row */}
                <tr>
                  <th className="sticky left-0 z-10 w-40 bg-card p-4 text-left align-bottom">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Provider</p>
                  </th>
                  {providers.map((p) => (
                    <th key={p.id} className="border-l border-border p-4 text-left align-top" style={{ minWidth: 240 }}>
                      <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-lg">
                        {p.coverUrl ? (
                          <Image src={p.coverUrl} alt={p.companyName} fill sizes="240px" className="object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-amber-200 to-orange-300" />
                        )}
                        <button
                          onClick={() => toggleCompare(p.id)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-destructive"
                          aria-label="Remove from compare"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <ProviderLogo name={p.companyName} size={32} />
                        <button onClick={() => openProvider(p.slug)} className="text-left text-sm font-bold leading-tight hover:text-primary">
                          {p.companyName}
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.verified && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </span>
                        )}
                        {p.premium && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            <Crown className="h-3 w-3" /> Premium
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.category?.name}</p>
                    </th>
                  ))}
                  {providers.length < 3 &&
                    Array.from({ length: 3 - providers.length }).map((_, i) => (
                      <th key={`empty-${i}`} className="border-l border-border p-4 align-top" style={{ minWidth: 200 }}>
                        <button
                          onClick={() => goBrowse({})}
                          className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          <GitCompare className="h-6 w-6" />
                          Add another
                        </button>
                      </th>
                    ))}
                </tr>

                {/* Data rows */}
                {rows.map((row) => {
                  const scores = providers.map((p) => (row.best ? row.best(p) : null));
                  const maxScore = scores.some((s) => s !== null) ? Math.max(...(scores.filter((s): s is number => s !== null))) : null;
                  return (
                    <tr key={row.label} className="border-t border-border">
                      <td className="sticky left-0 z-10 bg-card p-4">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <row.icon className="h-4 w-4 text-primary" />
                          {row.label}
                        </span>
                      </td>
                      {providers.map((p, idx) => {
                        const isBest = row.best !== undefined && maxScore !== null && scores[idx] === maxScore && providers.length > 1;
                        return (
                          <td key={p.id} className={cn("border-l border-border p-4 align-top text-sm", isBest && "bg-emerald-50 dark:bg-emerald-500/10")}>
                            <div className="flex items-start gap-1.5">
                              {isBest && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                              <span>{row.render(p)}</span>
                            </div>
                          </td>
                        );
                      })}
                      {providers.length < 3 &&
                        Array.from({ length: 3 - providers.length }).map((_, i) => (
                          <td key={`e-${i}`} className="border-l border-border p-4" />
                        ))}
                    </tr>
                  );
                })}

                {/* Action row */}
                <tr className="border-t border-border">
                  <td className="sticky left-0 z-10 bg-card p-4" />
                  {providers.map((p) => (
                    <td key={p.id} className="border-l border-border p-4">
                      <div className="flex flex-col gap-2">
                        <Button size="sm" className="w-full" onClick={() => openQuote(p.id, p.companyName)}>
                          Request quote
                        </Button>
                        <Button size="sm" variant="outline" className="w-full" onClick={() => openProvider(p.slug)}>
                          View profile
                        </Button>
                      </div>
                    </td>
                  ))}
                  {providers.length < 3 &&
                    Array.from({ length: 3 - providers.length }).map((_, i) => (
                      <td key={`ea-${i}`} className="border-l border-border p-4" />
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
        Highlighted cells indicate the best value in that category.
      </p>
    </div>
  );
}

"use client";

import Image from "next/image";
import { GitCompare, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketplace } from "@/lib/store";
import { useApi } from "@/hooks/use-api";
import { ProviderLogo } from "./provider-logo";
import type { ProviderListItem } from "@/lib/types";

export function CompareTray() {
  const compareIds = useMarketplace((s) => s.compareIds);
  const view = useMarketplace((s) => s.view);
  const openCompare = useMarketplace((s) => s.openCompare);
  const toggleCompare = useMarketplace((s) => s.toggleCompare);
  const clearCompare = useMarketplace((s) => s.clearCompare);

  const idsParam = compareIds.join(",");
  const { data } = useApi<{ providers: ProviderListItem[] }>(
    compareIds.length > 0 ? `/api/compare?ids=${idsParam}` : null,
    [idsParam],
  );
  const providers = data?.providers ?? [];

  if (compareIds.length === 0 || view === "compare") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-2xl backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GitCompare className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold leading-none">Compare ({providers.length}/3)</p>
            <p className="text-xs text-muted-foreground">Pick up to 3 to compare</p>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-thin">
          {providers.map((p) => (
            <div key={p.id} className="relative flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background p-1.5 pr-3">
              <div className="relative h-9 w-12 overflow-hidden rounded">
                {p.coverUrl ? (
                  <Image src={p.coverUrl} alt={p.companyName} fill sizes="48px" className="object-cover" />
                ) : (
                  <ProviderLogo name={p.companyName} size={36} className="!h-9 !w-9" />
                )}
              </div>
              <span className="max-w-[120px] truncate text-xs font-semibold">{p.companyName}</span>
              <button
                onClick={() => toggleCompare(p.id)}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                aria-label={`Remove ${p.companyName}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {providers.length < 3 &&
            Array.from({ length: 3 - providers.length }).map((_, i) => (
              <div key={i} className="flex h-[52px] w-24 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground">
                Empty
              </div>
            ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {compareIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCompare} className="hidden sm:inline-flex">
              Clear
            </Button>
          )}
          <Button size="sm" disabled={compareIds.length < 2} onClick={openCompare}>
            Compare now <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMarketplace } from "@/lib/store";
import { Header } from "./header";
import { Footer } from "./footer";
import { HomeView } from "./home-view";
import { BrowseView } from "./browse-view";
import { ProviderDetailView } from "./provider-detail-view";
import { CompareView } from "./compare-view";
import { InfoPage } from "./info-page";
import { ProviderDashboard } from "./provider-dashboard";
import { OnboardingForm } from "./onboarding-form";
import { CompareTray } from "./compare-tray";
import { QuoteDialog } from "./quote-dialog";
import { ReviewDialog } from "./review-dialog";
import type { Category, ProviderListItem } from "@/lib/types";

export function MarketplaceApp({
  categories,
  featured,
  topRated,
}: {
  categories: Category[];
  featured: ProviderListItem[];
  topRated: ProviderListItem[];
}) {
  const view = useMarketplace((s) => s.view);
  const selectedSlug = useMarketplace((s) => s.selectedSlug);
  const pageType = useMarketplace((s) => s.pageType);
  const dashboardSlug = useMarketplace((s) => s.dashboardSlug);

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        {view === "home" && <HomeView categories={categories} featured={featured} topRated={topRated} />}
        {view === "browse" && <BrowseView categories={categories} />}
        {view === "detail" && selectedSlug && <ProviderDetailView slug={selectedSlug} />}
        {view === "compare" && <CompareView />}
        {view === "page" && pageType && <InfoPage type={pageType} />}
        {view === "dashboard" && dashboardSlug && <ProviderDashboard slug={dashboardSlug} />}
        {view === "onboarding" && <OnboardingForm categories={categories} />}
      </main>
      <Footer categories={categories} />
      <CompareTray />
      <QuoteDialog />
      <ReviewDialog />
    </div>
  );
}

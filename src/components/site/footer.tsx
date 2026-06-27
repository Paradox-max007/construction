"use client";

import { HardHat, Twitter, Linkedin, Instagram, Facebook, Mail, MapPin, LayoutDashboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMarketplace } from "@/lib/store";
import { toast } from "sonner";
import type { Category } from "@/lib/types";

export function Footer({ categories }: { categories: Category[] }) {
  const goHome = useMarketplace((s) => s.goHome);
  const goBrowse = useMarketplace((s) => s.goBrowse);
  const openPage = useMarketplace((s) => s.openPage);
  const openOnboarding = useMarketplace((s) => s.openOnboarding);
  const requireDashboard = useMarketplace((s) => s.requireDashboard);

  // "For Customers" link definitions
  const customerLinks = [
    { label: "How it works", action: () => openPage("how-it-works") },
    { label: "Find a builder", action: () => goBrowse({ categorySlug: "house-construction", search: "" }) },
    { label: "Get quotes", action: () => goBrowse({ categorySlug: null, search: "" }) },
    { label: "Write a review", action: () => goBrowse({ categorySlug: null, search: "" }) },
    { label: "Pricing guide", action: () => openPage("pricing-guide") },
    { label: "Help center", action: () => openPage("help-center") },
  ];

  // "For Providers" link definitions
  const providerLinks = [
    { label: "List your business", action: openOnboarding },
    { label: "Pricing plans", action: () => openPage("pricing-plans") },
    { label: "Lead manager", action: () => requireDashboard() },
    { label: "Provider dashboard", action: () => requireDashboard() },
    { label: "Verification", action: () => openPage("verification") },
    { label: "Partner program", action: () => openPage("partner-program") },
  ];

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input");
    if (input?.value) {
      toast.success("Subscribed! We'll keep you posted.");
      input.value = "";
    }
  }

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand + newsletter */}
          <div className="col-span-2 lg:col-span-2">
            <button onClick={goHome} className="flex items-center gap-2" aria-label="BuildCraft home">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HardHat className="h-5 w-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                Build<span className="text-primary">Craft</span>
              </span>
            </button>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              The construction ecosystem where homeowners discover, compare, hire and manage verified building professionals — all in one place.
            </p>
            <form
              className="mt-4 flex max-w-sm gap-2"
              onSubmit={handleSubscribe}
            >
              <Input type="email" placeholder="Your email for updates" className="h-10" aria-label="Email" required />
              <Button type="submit" size="sm" className="h-10">
                Subscribe
              </Button>
            </form>
            <div className="mt-4 flex gap-2">
              {[Twitter, Linkedin, Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold">Categories</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => goBrowse({ categorySlug: c.slug, search: "" })}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For customers */}
          <div>
            <h4 className="text-sm font-bold">For Customers</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {customerLinks.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={l.action}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For providers */}
          <div>
            <h4 className="text-sm font-bold">For Providers</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {providerLinks.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={l.action}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Provider dashboard CTA strip */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-xl bg-primary/5 p-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold">Are you a provider? Manage your business</p>
              <p className="text-xs text-muted-foreground">Track leads, edit services, view analytics — all from one dashboard.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => requireDashboard()}>
            Open provider dashboard
          </Button>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} BuildCraft Technologies. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Bengaluru, India
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> hello@buildcraft.in
            </span>
            <button onClick={goHome} className="hover:text-primary">Privacy</button>
            <button onClick={goHome} className="hover:text-primary">Terms</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

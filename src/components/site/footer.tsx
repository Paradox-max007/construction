"use client";

import { HardHat, Twitter, Linkedin, Instagram, Facebook, Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMarketplace } from "@/lib/store";
import type { Category } from "@/lib/types";

export function Footer({ categories }: { categories: Category[] }) {
  const goHome = useMarketplace((s) => s.goHome);
  const goBrowse = useMarketplace((s) => s.goBrowse);

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
              onSubmit={(e) => e.preventDefault()}
            >
              <Input type="email" placeholder="Your email for updates" className="h-10" aria-label="Email" />
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
              {categories.slice(0, 6).map((c) => (
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
              {["How it works", "Find a builder", "Get quotes", "Write a review", "Pricing guide", "Help center"].map((l) => (
                <li key={l}>
                  <button
                    onClick={() => goBrowse({ categorySlug: null, search: "" })}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For providers */}
          <div>
            <h4 className="text-sm font-bold">For Providers</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {["List your business", "Pricing plans", "Lead manager", "Provider dashboard", "Verification", "Partner program"].map((l) => (
                <li key={l}>
                  <button
                    onClick={goHome}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
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

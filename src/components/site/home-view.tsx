"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Building2,
  Quote,
  CheckCircle2,
  TrendingUp,
  Wallet,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketplace } from "@/lib/store";
import { CategoryIcon } from "./category-icon";
import { ProviderCard } from "./provider-card";
import { StarRating } from "./star-rating";
import { ProviderLogo } from "./provider-logo";
import { formatCompact, formatCompactINR } from "@/lib/format";
import type { Category, ProviderListItem } from "@/lib/types";
import { useState } from "react";

const POPULAR_SEARCHES = ["Builders", "Interior Design", "Architects", "Electricians", "Painters"];

export function HomeView({
  categories,
  featured,
  topRated,
}: {
  categories: Category[];
  featured: ProviderListItem[];
  topRated: ProviderListItem[];
}) {
  const goBrowse = useMarketplace((s) => s.goBrowse);
  const openProvider = useMarketplace((s) => s.openProvider);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    goBrowse({ search: search.trim(), area: location.trim(), categorySlug: null });
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://sfile.chatglm.cn/images-ppt/8e30e66b1b0c.jpg"
            alt="Modern luxury home at dusk"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Badge className="mb-4 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/15">
              <Sparkles className="mr-1 h-3 w-3" /> India&apos;s construction ecosystem
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Build your dream home with{" "}
              <span className="text-amber-400">verified pros</span>
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base text-white/80 sm:text-lg">
              Discover, compare and hire trusted builders, architects, interior designers and contractors. Real portfolios, verified reviews, transparent pricing.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="mt-7 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="What are you looking for? e.g. Villa builder"
                  className="h-12 border-0 pl-9 shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="relative flex-1 border-t border-border sm:border-l sm:border-t-0">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location (e.g. Bengaluru)"
                  className="h-12 border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-7">
                Search <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            {/* Popular searches */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-white/70">Popular:</span>
              {POPULAR_SEARCHES.map((p) => (
                <button
                  key={p}
                  onClick={() => goBrowse({ search: p, categorySlug: null })}
                  className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap gap-8">
              {[
                { icon: Building2, label: "Verified providers", value: "2,400+" },
                { icon: CheckCircle2, label: "Projects completed", value: "18,000+" },
                { icon: Star, label: "Avg. rating", value: "4.8 / 5" },
                { icon: Users, label: "Happy homeowners", value: "45,000+" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-amber-400 backdrop-blur">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-white/70">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Explore</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Browse by category</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              From foundation to finishing — find the right expert for every job.
            </p>
          </div>
          <Button variant="outline" onClick={() => goBrowse({ categorySlug: null, search: "" })} className="hidden sm:inline-flex">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              onClick={() => goBrowse({ categorySlug: c.slug, search: "" })}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {c.imageUrl ? (
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-amber-200 to-orange-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-primary shadow-sm backdrop-blur">
                  <CategoryIcon name={c.icon} className="h-5 w-5" />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-base font-bold text-white">{c.name}</p>
                </div>
              </div>
              {c.description && (
                <p className="line-clamp-2 px-3 py-2.5 text-xs text-muted-foreground">{c.description}</p>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* FEATURED PROVIDERS */}
      {featured.length > 0 && (
        <section className="bg-muted/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Premium partners</p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Featured providers</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hand-picked, verified and top-rated professionals on BuildCraft.
                </p>
              </div>
              <Button variant="outline" onClick={() => goBrowse({ categorySlug: null, search: "" })} className="hidden sm:inline-flex">
                Browse all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => (
                <ProviderCard key={p.id} provider={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Simple process</p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">How BuildCraft works</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            From discovery to handover — hire the right professional in three simple steps.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Search,
              step: "01",
              title: "Discover & compare",
              desc: "Search by service, location or budget. Compare portfolios, reviews and pricing side by side.",
            },
            {
              icon: MessagesSquare,
              step: "02",
              title: "Connect & get quotes",
              desc: "Message providers directly or request a free quote. Share your requirements and timeline.",
            },
            {
              icon: ShieldCheck,
              step: "03",
              title: "Hire with confidence",
              desc: "Choose a verified pro with transparent pricing and milestone tracking. Build with trust.",
            },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="relative h-full overflow-hidden p-6">
                <span className="absolute right-4 top-3 text-5xl font-black text-primary/10">{s.step}</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TOP RATED */}
      {topRated.length > 0 && (
        <section className="bg-muted/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Highest rated</p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Top rated this month</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Loved by homeowners — ranked by verified reviews.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topRated.map((p, i) => (
                <ProviderCard key={p.id} provider={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY BUILDCRAFT / TRUST */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Why BuildCraft</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Trust is everything in construction</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We don&apos;t just list providers — we help you confidently evaluate and hire the right professional with the tools that build trust at every step.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { icon: ShieldCheck, title: "Verified businesses", desc: "GST, licenses and identity checks before any provider goes live." },
                { icon: Star, title: "Reviews tied to real projects", desc: "Every review is linked to a completed project, not anonymous." },
                { icon: Wallet, title: "Transparent pricing", desc: "See starting prices and packages upfront — no surprises later." },
                { icon: TrendingUp, title: "Side-by-side comparison", desc: "Compare up to 3 providers on the metrics that matter to you." },
              ].map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonial cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {topRated.slice(0, 4).map((p) => (
              <Card key={p.id} className="p-5">
                <Quote className="h-6 w-6 text-primary/30" />
                <p className="mt-2 text-sm text-foreground">
                  &ldquo;{p.tagline ?? p.description.slice(0, 80)}…&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <ProviderLogo name={p.companyName} size={36} />
                  <div className="min-w-0">
                    <button
                      onClick={() => openProvider(p.slug)}
                      className="block truncate text-left text-sm font-semibold hover:text-primary"
                    >
                      {p.companyName}
                    </button>
                    <StarRating rating={p.rating} showValue count={p.reviewsCount} size={12} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Starting {formatCompactINR(p.startingPrice)} · {p.experience} yrs exp
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOR PROVIDERS CTA */}
      <section id="list-your-business" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="relative grid items-center gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Are you a construction professional?</h2>
              <p className="mt-2 max-w-lg text-primary-foreground/85">
                List your business on BuildCraft and connect with thousands of homeowners planning their next project. Get verified, get featured, get more leads.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button size="lg" variant="secondary" onClick={() => goBrowse({ categorySlug: null, search: "" })}>
                  List your business <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => goBrowse({ categorySlug: null, search: "" })}>
                  See pricing plans
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: formatCompact(2400), label: "Active pros" },
                { value: "18k+", label: "Leads / mo" },
                { value: "4.8★", label: "Avg. rating" },
                { value: "₹0", label: "To start" },
                { value: "24h", label: "Avg. response" },
                { value: "32", label: "Cities" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/10 p-3 text-center backdrop-blur">
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-primary-foreground/80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

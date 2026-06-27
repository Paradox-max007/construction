"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Crown,
  MapPin,
  Briefcase,
  Clock,
  Languages,
  Mail,
  Phone,
  Globe,
  ShieldCheck,
  GitCompare,
  ArrowLeft,
  Star,
  Users,
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  MessageSquare,
  Quote,
  ChevronRight,
  Ruler,
  Wallet,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { StarRating } from "./star-rating";
import { ProviderLogo } from "./provider-logo";
import { useMarketplace } from "@/lib/store";
import { useApi } from "@/hooks/use-api";
import { formatINR, formatCompactINR, formatCompact, timeAgo, formatDuration } from "@/lib/format";
import type { About, ProviderDetail, ProviderPackage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProviderDetailView({ slug }: { slug: string }) {
  const { data, isLoading } = useApi<{ provider: ProviderDetail }>(`/api/providers/${slug}`, [slug]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const openQuote = useMarketplace((s) => s.openQuote);
  const openReview = useMarketplace((s) => s.openReview);
  const goBrowse = useMarketplace((s) => s.goBrowse);
  const toggleCompare = useMarketplace((s) => s.toggleCompare);
  const compareIds = useMarketplace((s) => s.compareIds);
  const openCompare = useMarketplace((s) => s.openCompare);

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  const p = data.provider;
  const about = (p.about ?? {}) as About;
  const packages = (p.packages ?? []) as ProviderPackage[];
  const inCompare = compareIds.includes(p.id);
  const allImages = p.projects.flatMap((pr) => pr.images);

  return (
    <div>
      {/* HERO COVER */}
      <div className="relative">
        <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-80">
          {p.coverUrl ? (
            <Image src={p.coverUrl} alt={p.companyName} fill priority sizes="100vw" className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-amber-300 to-orange-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        </div>

        {/* Back button */}
        <div className="absolute left-4 top-4 sm:left-6">
          <Button variant="secondary" size="sm" onClick={() => goBrowse({})} className="bg-white/90 backdrop-blur hover:bg-white">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>
      </div>

      {/* Profile header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end">
          <ProviderLogo name={p.companyName} size={96} className="ring-4 ring-background" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold sm:text-3xl">{p.companyName}</h1>
              {p.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              {p.premium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                  <Crown className="h-3.5 w-3.5" /> Premium
                </span>
              )}
            </div>
            {p.tagline && <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <StarRating rating={p.rating} showValue count={p.reviewsCount} size={16} />
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" /> {p.workingAreas[0] ?? "India"}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Briefcase className="h-4 w-4 text-primary" /> {p.experience} yrs exp
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Building2 className="h-4 w-4 text-primary" /> {formatCompact(p.projectsCount)} projects
              </span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Star, label: "Rating", value: p.rating.toFixed(1) },
            { icon: Briefcase, label: "Experience", value: `${p.experience} yrs` },
            { icon: Users, label: "Team size", value: formatCompact(p.employees) },
            { icon: Wallet, label: "Starting at", value: formatCompactINR(p.startingPrice) },
          ].map((s) => (
            <Card key={s.label} className="flex items-center gap-3 p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Main grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left: tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="grid h-auto w-full grid-cols-3 sm:grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="contact" className="col-span-2 sm:col-span-1">Contact</TabsTrigger>
              </TabsList>

              {/* OVERVIEW */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card className="p-6">
                  <h2 className="text-lg font-bold">About {p.companyName}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </Card>

                {/* Mission / Vision / USP */}
                {(about.mission || about.vision || about.usp) && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {about.mission && (
                      <Card className="p-5">
                        <Target className="h-5 w-5 text-primary" />
                        <h3 className="mt-2 text-sm font-bold">Mission</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{about.mission}</p>
                      </Card>
                    )}
                    {about.vision && (
                      <Card className="p-5">
                        <Eye className="h-5 w-5 text-primary" />
                        <h3 className="mt-2 text-sm font-bold">Vision</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{about.vision}</p>
                      </Card>
                    )}
                    {about.usp && (
                      <Card className="p-5">
                        <Sparkles2 className="h-5 w-5 text-primary" />
                        <h3 className="mt-2 text-sm font-bold">USP</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{about.usp}</p>
                      </Card>
                    )}
                  </div>
                )}

                {/* Why choose us */}
                {about.why && about.why.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-sm font-bold">Why choose us</h3>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {about.why.map((w) => (
                        <li key={w} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Services */}
                {p.services.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-sm font-bold">Services offered</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.services.map((s) => (
                        <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Certificates */}
                {p.certificates.length > 0 && (
                  <Card className="p-6">
                    <h3 className="flex items-center gap-2 text-sm font-bold">
                      <Award className="h-4 w-4 text-primary" /> Certificates & licenses
                    </h3>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {p.certificates.map((c) => (
                        <div key={c} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Working areas */}
                {p.workingAreas.length > 0 && (
                  <Card className="p-6">
                    <h3 className="flex items-center gap-2 text-sm font-bold">
                      <MapPin className="h-4 w-4 text-primary" /> Working areas
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.workingAreas.map((a) => (
                        <Badge key={a} variant="outline">{a}</Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* PORTFOLIO */}
              <TabsContent value="portfolio" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Portfolio ({p.projects.length})</h2>
                  <p className="text-sm text-muted-foreground">{allImages.length} photos</p>
                </div>
                {p.projects.length === 0 ? (
                  <Card className="p-8 text-center text-sm text-muted-foreground">No projects yet.</Card>
                ) : (
                  <div className="space-y-6">
                    {p.projects.map((pr, i) => (
                      <motion.div
                        key={pr.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.05 }}
                      >
                        <Card className="overflow-hidden">
                          <div className="grid md:grid-cols-2">
                            {/* Images */}
                            <div className="relative aspect-[4/3] w-full">
                              {pr.images[0] && (
                                <button onClick={() => setLightbox(pr.images[0])} className="group relative block h-full w-full">
                                  <Image src={pr.images[0]} alt={pr.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                  <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">{pr.images.length} photos</span>
                                </button>
                              )}
                            </div>
                            {/* Details */}
                            <div className="flex flex-col gap-3 p-5">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    {pr.featured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
                                    {pr.category && <Badge variant="secondary" className="bg-accent text-accent-foreground">{pr.category}</Badge>}
                                  </div>
                                  <h3 className="mt-2 text-lg font-bold">{pr.title}</h3>
                                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" /> {pr.location}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{pr.description}</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <Meta icon={Wallet} label="Budget" value={pr.budget ? formatINR(pr.budget) : "—"} />
                                <Meta icon={Ruler} label="Area" value={pr.area ?? "—"} />
                                <Meta icon={Calendar} label="Duration" value={pr.durationWeeks ? formatDuration(pr.durationWeeks) : "—"} />
                                <Meta icon={Home} label="Client" value={pr.clientName ?? "—"} />
                              </div>
                              {pr.materials.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {pr.materials.map((m) => (
                                    <Badge key={m} variant="outline" className="font-normal">{m}</Badge>
                                  ))}
                                </div>
                              )}
                              {pr.clientReview && (
                                <div className="mt-1 rounded-lg bg-muted/60 p-3">
                                  <div className="flex items-center gap-2">
                                    <Quote className="h-4 w-4 text-primary/50" />
                                    <StarRating rating={pr.clientRating ?? 5} size={12} />
                                  </div>
                                  <p className="mt-1.5 text-sm italic">&ldquo;{pr.clientReview}&rdquo;</p>
                                  <p className="mt-1 text-xs text-muted-foreground">— {pr.clientName}</p>
                                </div>
                              )}
                              {/* Extra thumbnails */}
                              {pr.images.length > 1 && (
                                <div className="flex gap-2">
                                  {pr.images.slice(1, 4).map((img) => (
                                    <button key={img} onClick={() => setLightbox(img)} className="relative h-16 w-20 overflow-hidden rounded-lg">
                                      <Image src={img} alt={pr.title} fill sizes="80px" className="object-cover transition-transform hover:scale-110" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* REVIEWS */}
              <TabsContent value="reviews" className="mt-6 space-y-6">
                <Card className="p-6">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-4xl font-extrabold text-primary">{p.rating.toFixed(1)}</p>
                        <StarRating rating={p.rating} size={14} />
                        <p className="mt-1 text-xs text-muted-foreground">{p.reviewsCount} reviews</p>
                      </div>
                      <Separator orientation="vertical" className="hidden h-16 sm:block" />
                      <div className="hidden flex-col gap-1 sm:flex">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = p.reviews.filter((r) => r.rating === star).length;
                          const pct = p.reviews.length ? (count / p.reviews.length) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="w-3 text-muted-foreground">{star}</span>
                              <Star className="h-3 w-3 text-amber-500" />
                              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                                <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-5 text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <Button onClick={() => openReview(p.id, p.companyName)}>
                      <MessageSquare className="mr-1 h-4 w-4" /> Write a review
                    </Button>
                  </div>
                </Card>

                {p.reviews.length === 0 ? (
                  <Card className="p-8 text-center text-sm text-muted-foreground">No reviews yet. Be the first to review!</Card>
                ) : (
                  <div className="space-y-4">
                    {p.reviews.map((r) => (
                      <Card key={r.id} className="p-5">
                        <div className="flex items-start gap-3">
                          <ProviderLogo name={r.customerName} size={40} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{r.customerName}</p>
                              {r.verified && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                  <BadgeCheck className="h-3 w-3" /> Verified customer
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <StarRating rating={r.rating} size={12} />
                              {r.projectType && <span className="text-xs text-muted-foreground">· {r.projectType}</span>}
                            </div>
                            {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                            <p className="mt-1 text-sm text-muted-foreground">{r.review}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* PRICING */}
              <TabsContent value="pricing" className="mt-6 space-y-6">
                <h2 className="text-lg font-bold">Pricing & packages</h2>
                {packages.length === 0 ? (
                  <Card className="p-8 text-center text-sm text-muted-foreground">
                    Starting at <span className="font-bold text-foreground">{formatCompactINR(p.startingPrice)}</span>. Contact for custom quotes.
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {packages.map((pkg, i) => {
                      const popular = i === 1 && packages.length === 3;
                      return (
                        <Card key={pkg.name} className={cn("relative flex flex-col p-5", popular && "border-primary shadow-lg ring-1 ring-primary/30")}>
                          {popular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                              Most popular
                            </span>
                          )}
                          <h3 className="text-base font-bold">{pkg.name}</h3>
                          <p className="text-xs text-muted-foreground">{pkg.desc}</p>
                          <p className="mt-3">
                            <span className="text-2xl font-extrabold text-primary">{formatCompactINR(pkg.price)}</span>
                            <span className="text-sm text-muted-foreground">/{pkg.priceUnit}</span>
                          </p>
                          <Separator className="my-3" />
                          <ul className="flex-1 space-y-2">
                            {pkg.features.map((f) => (
                              <li key={f} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                          <Button className="mt-4 w-full" variant={popular ? "default" : "outline"} onClick={() => openQuote(p.id, p.companyName)}>
                            Request quote
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* CONTACT */}
              <TabsContent value="contact" className="mt-6 space-y-6">
                <Card className="p-6">
                  <h2 className="text-lg font-bold">Contact information</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-semibold">{p.phone}</p>
                        </div>
                      </a>
                    )}
                    {p.email && (
                      <a href={`mailto:${p.email}`} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-semibold">{p.email}</p>
                        </div>
                      </a>
                    )}
                    {p.website && (
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Website</p>
                          <p className="text-sm font-semibold">{p.website}</p>
                        </div>
                      </div>
                    )}
                    {p.responseTime && (
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Response time</p>
                          <p className="text-sm font-semibold">{p.responseTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {p.officeAddress && (
                    <div className="mt-4 flex items-start gap-3 rounded-lg border border-border p-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Office address</p>
                        <p className="text-sm font-semibold">{p.officeAddress}</p>
                      </div>
                    </div>
                  )}
                  {p.languages.length > 0 && (
                    <div className="mt-4 flex items-center gap-3">
                      <Languages className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Languages</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {p.languages.map((l) => (
                            <Badge key={l} variant="outline">{l}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
                <Button size="lg" className="w-full" onClick={() => openQuote(p.id, p.companyName)}>
                  Request a free quote <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: sticky contact card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <Card className="p-5">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Starting at</p>
                  <StarRating rating={p.rating} showValue size={12} />
                </div>
                <p className="text-2xl font-extrabold text-primary">
                  {formatCompactINR(p.startingPrice)}
                  <span className="text-sm font-normal text-muted-foreground">/{p.priceUnit}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Final price varies with scope & materials</p>

                <div className="mt-4 space-y-2">
                  <Button className="w-full" size="lg" onClick={() => openQuote(p.id, p.companyName)}>
                    Request free quote
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => openReview(p.id, p.companyName)}>
                      <MessageSquare className="mr-1 h-4 w-4" /> Review
                    </Button>
                    <Button
                      variant={inCompare ? "default" : "outline"}
                      onClick={() => toggleCompare(p.id)}
                    >
                      <GitCompare className="mr-1 h-4 w-4" /> {inCompare ? "Added" : "Compare"}
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  {p.responseTime && (
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" /> Response</span>
                      <span className="font-semibold">{p.responseTime}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Briefcase className="h-4 w-4" /> Experience</span>
                    <span className="font-semibold">{p.experience} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Users className="h-4 w-4" /> Team</span>
                    <span className="font-semibold">{formatCompact(p.employees)} people</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Building2 className="h-4 w-4" /> Projects</span>
                    <span className="font-semibold">{formatCompact(p.projectsCount)} done</span>
                  </div>
                </div>
              </Card>

              {inCompare && compareIds.length >= 2 && (
                <Button className="w-full" size="lg" onClick={openCompare}>
                  Compare {compareIds.length} providers <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}

              <Card className="bg-emerald-50 p-4 dark:bg-emerald-500/10">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">BuildCraft verified</p>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                      Business documents, GST and identity checked by our team.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="h-12" />
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-4xl border-0 bg-black/90 p-0">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          {lightbox && (
            <div className="relative aspect-[16/10] w-full">
              <Image src={lightbox} alt="Project photo" fill sizes="100vw" className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

// small inline icons to avoid extra imports clutter
function Target(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function Sparkles2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

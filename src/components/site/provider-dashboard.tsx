"use client";

import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  BarChart3,
  Star,
  ArrowLeft,
  TrendingUp,
  Eye,
  CheckCircle2,
  Trophy,
  Phone,
  Mail,
  MapPin,
  Wallet,
  Plus,
  X,
  Save,
  Loader2,
  Clock,
  Target,
  Calendar,
  ChevronRight,
  Building2,
  LogIn,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProviderLogo } from "./provider-logo";
import { StarRating } from "./star-rating";
import { useMarketplace, type DashboardTab } from "@/lib/store";
import { useApi, postJSON } from "@/hooks/use-api";
import { formatCompactINR, formatCompact, timeAgo } from "@/lib/format";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { Lead, LeadStatus, LeadsResponse, ProviderDetail, ProviderPackage, MeResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; dot: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", dot: "bg-blue-500" },
  contacted: { label: "Contacted", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", dot: "bg-amber-500" },
  quoted: { label: "Quoted", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400", dot: "bg-violet-500" },
  won: { label: "Won", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", dot: "bg-emerald-500" },
  lost: { label: "Lost", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400", dot: "bg-rose-500" },
};

const TABS: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Inbox },
  { id: "profile", label: "Profile", icon: Building2 },
  { id: "services", label: "Services", icon: Wrench },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "reviews", label: "Reviews", icon: Star },
];

export function ProviderDashboard({ slug: _slug }: { slug: string }) {
  const tab = useMarketplace((s) => s.dashboardTab);
  const setTab = useMarketplace((s) => s.setDashboardTab);
  const goBrowse = useMarketplace((s) => s.goBrowse);
  const goHome = useMarketplace((s) => s.goHome);
  const openLogin = useMarketplace((s) => s.openLogin);
  const authUser = useMarketplace((s) => s.authUser);

  // Fetch the logged-in provider via /api/auth/me (auth-gated)
  const { data, isLoading, refetch } = useApi<MeResponse>("/api/auth/me", []);
  const authenticated = data?.authenticated;
  const p = data?.provider;

  // Not authenticated state
  if (!isLoading && !authenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Login required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You need to log in with your provider credentials to access the dashboard. Each provider manages only their own account.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={openLogin}>
            <LogIn className="mr-1 h-4 w-4" /> Go to login
          </Button>
          <Button size="lg" variant="outline" onClick={goHome}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !p) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
        </div>
        <div className="mt-6 h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => goBrowse({})}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Exit dashboard
        </Button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Logged in as {authUser?.email ?? p.email}
        </span>
      </div>

      {/* Provider identity header */}
      <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <ProviderLogo name={p.companyName} size={56} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold">{p.companyName}</h1>
            {p.verified && <Badge className="bg-emerald-500 text-white">Verified</Badge>}
            {p.premium && <Badge className="bg-amber-500 text-white">Premium</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{p.tagline ?? p.category?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Profile completion</p>
            <p className="text-lg font-bold">{profileCompletion(p)}%</p>
          </div>
          <Progress value={profileCompletion(p)} className="h-2 w-24" />
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab provider={p} slug={p.slug} />}
      {tab === "leads" && <LeadsTab providerId={p.id} />}
      {tab === "profile" && <ProfileTab provider={p} onSaved={refetch} />}
      {tab === "services" && <ServicesTab provider={p} onSaved={refetch} />}
      {tab === "analytics" && <AnalyticsTab provider={p} />}
      {tab === "reviews" && <ReviewsTab provider={p} />}
    </div>
  );
}

// Compute profile completion percentage
function profileCompletion(p: ProviderDetail): number {
  let done = 0;
  const total = 10;
  if (p.description) done++;
  if (p.about) done++;
  if (p.coverUrl) done++;
  if (p.services.length > 0) done++;
  if (p.workingAreas.length > 0) done++;
  if (p.officeAddress) done++;
  if (p.certificates.length > 0) done++;
  if ((p.packages ?? []).length > 0) done++;
  if (p.projects.length > 0) done++;
  if (p.reviews.length > 0) done++;
  return Math.round((done / total) * 100);
}

// ---------- Overview ----------
function OverviewTab({ provider, slug }: { provider: ProviderDetail; slug: string }) {
  const setTab = useMarketplace((s) => s.setDashboardTab);
  const openProvider = useMarketplace((s) => s.openProvider);
  const { data: leadsData } = useApi<LeadsResponse>(`/api/quote-requests?providerId=${provider.id}`, [provider.id]);
  const leads = leadsData?.quoteRequests ?? [];
  const newLeads = leads.filter((l) => l.status === "new").length;
  const wonLeads = leads.filter((l) => l.status === "won").length;
  const conversionRate = leads.length ? Math.round((wonLeads / leads.length) * 100) : 0;

  const stats = [
    { label: "New leads", value: newLeads, icon: Inbox, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Profile views", value: formatCompact(provider.profileViews), icon: Eye, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { label: "Conversion rate", value: `${conversionRate}%`, icon: Target, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "Avg. rating", value: provider.rating.toFixed(1), icon: Star, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
  ];

  const checklist = [
    { done: !!provider.coverUrl, label: "Add a cover image" },
    { done: !!provider.about, label: "Complete About / mission section" },
    { done: provider.services.length > 0, label: "List your services" },
    { done: provider.certificates.length > 0, label: "Upload certificates" },
    { done: (provider.packages ?? []).length > 0, label: "Create pricing packages" },
    { done: provider.projects.length >= 3, label: "Add at least 3 portfolio projects" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", s.bg, s.color)}>
                <s.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent leads */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <Inbox className="h-4 w-4 text-primary" /> Recent leads
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setTab("leads")}>
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {leads.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No leads yet. They&apos;ll appear here when customers request quotes.</p>
          ) : (
            <div className="space-y-2">
              {leads.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <ProviderLogo name={l.customerName} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.customerName}</p>
                    <p className="truncate text-xs text-muted-foreground">{l.projectType} · {l.location ?? "—"}</p>
                  </div>
                  <Badge className={STATUS_CONFIG[l.status].color}>{STATUS_CONFIG[l.status].label}</Badge>
                  <span className="hidden text-xs text-muted-foreground sm:block">{timeAgo(l.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Profile completion checklist */}
        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Complete your profile
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">Profiles 100% complete get 3× more leads.</p>
          <div className="space-y-2">
            {checklist.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm">
                {c.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={cn(c.done ? "text-muted-foreground line-through" : "text-foreground")}>{c.label}</span>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" size="sm" variant="outline" onClick={() => setTab("profile")}>
            Edit profile <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <Button className="mt-2 w-full" size="sm" onClick={() => openProvider(slug)}>
            View public profile
          </Button>
        </Card>
      </div>
    </div>
  );
}

// ---------- Leads manager ----------
function LeadsTab({ providerId }: { providerId: string }) {
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const { data, isLoading, refetch } = useApi<LeadsResponse>(`/api/quote-requests?providerId=${providerId}`, [providerId]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const leads = data?.quoteRequests ?? [];
  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  async function updateStatus(lead: Lead, status: LeadStatus) {
    setUpdatingId(lead.id);
    const res = await postJSON<{ success: boolean }>(`/api/quote-requests/${lead.id}`, { status });
    setUpdatingId(null);
    if (res.ok) {
      toast.success(`Lead marked as ${STATUS_CONFIG[status].label}`);
      refetch();
    } else {
      toast.error(res.error ?? "Failed to update lead");
    }
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length, new: 0, contacted: 0, quoted: 0, won: 0, lost: 0 };
    leads.forEach((l) => { c[l.status]++; });
    return c;
  }, [leads]);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "new", "contacted", "quoted", "won", "lost"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent",
            )}
          >
            {s === "all" ? "All" : STATUS_CONFIG[s].label} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Loading leads…</Card>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No leads in this category</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Leads appear here when customers request quotes from your profile. Try improving your profile to attract more.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Project</TableHead>
                  <TableHead className="hidden lg:table-cell">Budget</TableHead>
                  <TableHead className="hidden lg:table-cell">Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <ProviderLogo name={l.customerName} size={32} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{l.customerName}</p>
                          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {l.location ?? "—"}
                          </p>
                          {l.customerPhone && (
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {l.customerPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <p className="text-sm font-medium">{l.projectType}</p>
                        {l.timeline && <p className="text-xs text-muted-foreground">⏱ {l.timeline}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{l.budget ?? "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{timeAgo(l.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_CONFIG[l.status].color}>
                        <span className={cn("mr-1 h-1.5 w-1.5 rounded-full", STATUS_CONFIG[l.status].dot)} />
                        {STATUS_CONFIG[l.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={l.status}
                        disabled={updatingId === l.id}
                        onValueChange={(v) => updateStatus(l, v as LeadStatus)}
                      >
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["new", "contacted", "quoted", "won", "lost"] as const).map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {filtered.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Lead details</h3>
          <div className="space-y-3">
            {filtered.slice(0, 3).map((l) => (
              <div key={l.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{l.customerName} · {l.projectType}</p>
                  <span className="text-xs text-muted-foreground">{timeAgo(l.createdAt)}</span>
                </div>
                {l.message && <p className="mt-1 text-sm text-muted-foreground">&ldquo;{l.message}&rdquo;</p>}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {l.budget && <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> {l.budget}</span>}
                  {l.timeline && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {l.timeline}</span>}
                  {l.customerEmail && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {l.customerEmail}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------- Profile editor ----------
function ProfileTab({ provider, onSaved }: { provider: ProviderDetail; onSaved?: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: provider.companyName,
    tagline: provider.tagline ?? "",
    description: provider.description,
    officeAddress: provider.officeAddress ?? "",
    email: provider.email ?? "",
    phone: provider.phone ?? "",
    website: provider.website ?? "",
    responseTime: provider.responseTime ?? "",
    experience: provider.experience,
    employees: provider.employees,
    startingPrice: provider.startingPrice,
    priceUnit: provider.priceUnit,
  });
  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    const res = await postJSON(`/api/providers/${provider.slug}`, form);
    setSaving(false);
    if (res.ok) { toast.success("Profile updated successfully!"); onSaved?.(); }
    else toast.error(res.error ?? "Failed to save");
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold">Company information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
          </Field>
          <Field label="Tagline">
            <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Short catchy line" />
          </Field>
          <Field label="Email" className="sm:col-span-2">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Website">
            <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="yourcompany.in" />
          </Field>
          <Field label="Office address" className="sm:col-span-2">
            <Input value={form.officeAddress} onChange={(e) => set("officeAddress", e.target.value)} />
          </Field>
          <Field label="Response time">
            <Input value={form.responseTime} onChange={(e) => set("responseTime", e.target.value)} placeholder="e.g. Under 2 hours" />
          </Field>
          <Field label="Default price unit">
            <Select value={form.priceUnit} onValueChange={(v) => set("priceUnit", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sqft">per sqft</SelectItem>
                <SelectItem value="project">per project</SelectItem>
                <SelectItem value="hour">per hour</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold">About & description</h2>
        <Field label="Company description">
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
        </Field>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-lg font-bold">Business metrics</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Experience (years)">
            <Input type="number" value={form.experience} onChange={(e) => set("experience", Number(e.target.value))} />
          </Field>
          <Field label="Team size (employees)">
            <Input type="number" value={form.employees} onChange={(e) => set("employees", Number(e.target.value))} />
          </Field>
          <Field label="Starting price (₹)">
            <Input type="number" value={form.startingPrice} onChange={(e) => set("startingPrice", Number(e.target.value))} />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setForm({
          companyName: provider.companyName, tagline: provider.tagline ?? "", description: provider.description,
          officeAddress: provider.officeAddress ?? "", email: provider.email ?? "", phone: provider.phone ?? "",
          website: provider.website ?? "", responseTime: provider.responseTime ?? "", experience: provider.experience,
          employees: provider.employees, startingPrice: provider.startingPrice, priceUnit: provider.priceUnit,
        })}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-1 h-4 w-4" /> Save changes</>}
        </Button>
      </div>
    </div>
  );
}

// ---------- Services editor ----------
function ServicesTab({ provider, onSaved }: { provider: ProviderDetail; onSaved?: () => void }) {
  const [services, setServices] = useState<string[]>(provider.services);
  const [workingAreas, setWorkingAreas] = useState<string[]>(provider.workingAreas);
  const [languages, setLanguages] = useState<string[]>(provider.languages);
  const [certificates, setCertificates] = useState<string[]>(provider.certificates);
  const [newItem, setNewItem] = useState({ services: "", areas: "", langs: "", certs: "" });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await postJSON(`/api/providers/${provider.slug}`, {
      services, workingAreas, languages, certificates,
    });
    setSaving(false);
    if (res.ok) { toast.success("Services & details updated!"); onSaved?.(); }
    else toast.error(res.error ?? "Failed to save");
  }

  function add(field: "services" | "areas" | "langs" | "certs") {
    const val = newItem[field].trim();
    if (!val) return;
    if (field === "services") setServices((s) => [...s, val]);
    if (field === "areas") setWorkingAreas((s) => [...s, val]);
    if (field === "langs") setLanguages((s) => [...s, val]);
    if (field === "certs") setCertificates((s) => [...s, val]);
    setNewItem((n) => ({ ...n, [field]: "" }));
  }

  function remove(field: "services" | "areas" | "langs" | "certs", idx: number) {
    if (field === "services") setServices((s) => s.filter((_, i) => i !== idx));
    if (field === "areas") setWorkingAreas((s) => s.filter((_, i) => i !== idx));
    if (field === "langs") setLanguages((s) => s.filter((_, i) => i !== idx));
    if (field === "certs") setCertificates((s) => s.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-6">
      <TagEditor
        title="Services offered"
        desc="What services does your business provide? Customers search by these."
        items={services}
        placeholder="e.g. Villa Construction"
        value={newItem.services}
        onChange={(v) => setNewItem((n) => ({ ...n, services: v }))}
        onAdd={() => add("services")}
        onRemove={(i) => remove("services", i)}
        icon={Wrench}
      />
      <TagEditor
        title="Working areas"
        desc="Cities and regions you serve. Customers filter by location."
        items={workingAreas}
        placeholder="e.g. Bengaluru"
        value={newItem.areas}
        onChange={(v) => setNewItem((n) => ({ ...n, areas: v }))}
        onAdd={() => add("areas")}
        onRemove={(i) => remove("areas", i)}
        icon={MapPin}
      />
      <TagEditor
        title="Languages spoken"
        desc="Helps customers communicate comfortably."
        items={languages}
        placeholder="e.g. Kannada"
        value={newItem.langs}
        onChange={(v) => setNewItem((n) => ({ ...n, langs: v }))}
        onAdd={() => add("langs")}
        onRemove={(i) => remove("langs", i)}
        icon={Mail}
      />
      <TagEditor
        title="Certificates & licenses"
        desc="GST, trade license, ISO — builds trust with customers."
        items={certificates}
        placeholder="e.g. GST Registered"
        value={newItem.certs}
        onChange={(v) => setNewItem((n) => ({ ...n, certs: v }))}
        onAdd={() => add("certs")}
        onRemove={(i) => remove("certs", i)}
        icon={CheckCircle2}
      />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-1 h-4 w-4" /> Save all changes</>}
        </Button>
      </div>
    </div>
  );
}

function TagEditor({
  title, desc, items, placeholder, value, onChange, onAdd, onRemove, icon: Icon,
}: {
  title: string; desc: string; items: string[]; placeholder: string;
  value: string; onChange: (v: string) => void; onAdd: () => void; onRemove: (i: number) => void;
  icon: React.ElementType;
}) {
  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Icon className="h-5 w-5 text-primary" /> {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((it, i) => (
          <Badge key={i} variant="secondary" className="gap-1 bg-accent py-1 pl-3 pr-1.5 text-accent-foreground">
            {it}
            <button onClick={() => onRemove(i)} className="ml-1 rounded-full p-0.5 hover:bg-background">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing added yet.</p>}
      </div>
      <div className="mt-4 flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          className="h-9"
        />
        <Button size="sm" variant="outline" onClick={onAdd} className="h-9">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </Card>
  );
}

// ---------- Analytics ----------
function AnalyticsTab({ provider }: { provider: ProviderDetail }) {
  const { data: leadsData } = useApi<LeadsResponse>(`/api/quote-requests?providerId=${provider.id}`, [provider.id]);
  const leads = leadsData?.quoteRequests ?? [];

  // Build last 7 days leads chart
  const days = useMemo(() => {
    const arr: { day: string; leads: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { weekday: "short" });
      const count = leads.filter((l) => {
        const ld = new Date(l.createdAt);
        return ld.toDateString() === d.toDateString();
      }).length;
      arr.push({ day: label, leads: count });
    }
    return arr;
  }, [leads]);

  // Lead status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { counts[l.status] = (counts[l.status] ?? 0) + 1; });
    return (Object.keys(STATUS_CONFIG) as LeadStatus[]).map((s) => ({
      name: STATUS_CONFIG[s].label,
      value: counts[s] ?? 0,
      status: s,
    })).filter((d) => d.value > 0);
  }, [leads]);

  const PIE_COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981", "#f43f5e"];

  const sources = [
    { source: "Search results", pct: 42 },
    { source: "Category browse", pct: 28 },
    { source: "Featured carousel", pct: 18 },
    { source: "Direct profile link", pct: 12 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Profile views", value: formatCompact(provider.profileViews), icon: Eye, sub: "+12% this week" },
          { label: "Total leads", value: leads.length, icon: Inbox, sub: "All time" },
          { label: "Won projects", value: leads.filter((l) => l.status === "won").length, icon: Trophy, sub: "From this dashboard" },
          { label: "Saved by users", value: Math.round(provider.profileViews * 0.08), icon: Star, sub: "In compare lists" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className="h-5 w-5 text-primary" />
            <p className="mt-2 text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-[11px] text-emerald-600">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads over time */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <TrendingUp className="h-4 w-4 text-primary" /> Leads — last 7 days
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Lead status distribution */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <Target className="h-4 w-4 text-primary" /> Lead funnel
          </h2>
          {statusData.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No lead data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Lead sources */}
      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <BarChart3 className="h-4 w-4 text-primary" /> Where your leads come from
        </h2>
        <div className="space-y-3">
          {sources.map((s) => (
            <div key={s.source}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{s.source}</span>
                <span className="text-muted-foreground">{s.pct}%</span>
              </div>
              <Progress value={s.pct} className="h-2" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---------- Reviews ----------
function ReviewsTab({ provider }: { provider: ProviderDetail }) {
  const reviews = provider.reviews;
  const dist = useMemo(() => {
    const c = [0, 0, 0, 0, 0];
    reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) c[r.rating - 1]++; });
    return c.reverse(); // 5..1
  }, [reviews]);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="text-center">
            <p className="text-5xl font-extrabold text-primary">{provider.rating.toFixed(1)}</p>
            <StarRating rating={provider.rating} size={16} />
            <p className="mt-1 text-xs text-muted-foreground">{provider.reviewsCount} reviews</p>
          </div>
          <Separator orientation="vertical" className="hidden h-24 sm:block" />
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star, i) => {
              const count = dist[i];
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{star}</span>
                  <Star className="h-3 w-3 text-amber-500" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {reviews.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">No reviews yet.</Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start gap-3">
                <ProviderLogo name={r.customerName} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{r.customerName}</p>
                    {r.verified && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">Verified</Badge>}
                    <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                  </div>
                  <StarRating rating={r.rating} size={12} />
                  {r.title && <p className="mt-1 text-sm font-semibold">{r.title}</p>}
                  <p className="text-sm text-muted-foreground">{r.review}</p>
                  {r.projectType && <p className="mt-1 text-xs text-muted-foreground">Project: {r.projectType}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-semibold">{label}</Label>
      {children}
    </div>
  );
}

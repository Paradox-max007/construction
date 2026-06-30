"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  Building2,
  Inbox,
  BarChart3,
  CreditCard,
  Tag,
  Loader2,
  LogIn,
  ShieldAlert,
  Save,
  Shield,
  Star,
  Crown,
  Trophy,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Phone,
  Mail,
  ExternalLink,
  Calendar,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProviderLogo } from "./provider-logo";
import { useMarketplace } from "@/lib/store";
import { useApi, postJSON } from "@/hooks/use-api";
import { toast } from "sonner";
import { formatCompactINR, formatINR, timeAgo } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  AdminMeResponse,
  AdminStatsResponse,
  AdminProvidersResponse,
  AdminProvider,
  AdminCustomersResponse,
  AdminCustomer,
  AdminLeadsResponse,
  AdminLead,
  PlansResponse,
  Plan,
  OffersResponse,
  Offer,
  SubscriptionsResponse,
  Subscription,
  RevenueReport,
  LeadStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" },
  contacted: { label: "Contacted", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400" },
  quoted: { label: "Quoted", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400" },
  won: { label: "Won", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" },
  lost: { label: "Lost", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400" },
};

type AdminTab = "overview" | "plans" | "subscriptions" | "providers" | "customers" | "leads" | "reports";

const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "plans", label: "Plans & Offers", icon: CreditCard },
  { id: "subscriptions", label: "Subscriptions", icon: ReceiptIcon },
  { id: "providers", label: "Providers", icon: Building2 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "leads", label: "Leads", icon: Inbox },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return <CreditCard {...props} />;
}

export function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const goHome = useMarketplace((s) => s.goHome);
  const openLogin = useMarketplace((s) => s.openLoginWithRole);
  const adminUser = useMarketplace((s) => s.adminUser);

  const { data, isLoading } = useApi<AdminMeResponse>("/api/auth/admin/me", []);
  const admin = data?.admin;

  if (!isLoading && !admin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Admin login required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your admin credentials to access the marketplace control panel.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={() => openLogin("customer")}>
            <LogIn className="mr-1 h-4 w-4" /> Go to admin sign-in
          </Button>
          <Button size="lg" variant="outline" onClick={goHome}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !admin) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={goHome}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Exit admin
        </Button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          <Shield className="h-3.5 w-3.5" /> {admin.role === "super_admin" ? "Super admin" : "Admin"} · {adminUser?.email ?? admin.email}
        </span>
      </div>

      {/* Identity header */}
      <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500 text-white">
          <Shield className="h-7 w-7" />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold">{admin.name}</h1>
            <Badge className="bg-amber-500 text-white">{admin.role}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{admin.email}</p>
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

      {tab === "overview" && <OverviewTab />}
      {tab === "plans" && <PlansTab />}
      {tab === "subscriptions" && <SubscriptionsTab />}
      {tab === "providers" && <ProvidersTab />}
      {tab === "customers" && <CustomersTab />}
      {tab === "leads" && <LeadsTab />}
      {tab === "reports" && <ReportsTab />}
    </div>
  );
}

// ---------- Overview ----------
function OverviewTab() {
  const { data, isLoading } = useApi<AdminStatsResponse>("/api/admin/stats", []);
  const { data: leadsData } = useApi<AdminLeadsResponse>("/api/admin/leads", []);
  const { data: subsData } = useApi<SubscriptionsResponse>("/api/admin/subscriptions", []);
  const stats = data?.stats;

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
      </div>
    );
  }

  const cards = [
    { label: "Providers", value: stats.providers, sub: `${stats.approvedProviders} approved`, icon: Building2, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { label: "Pending approvals", value: stats.pendingApprovals, sub: `${stats.pendingVerifications} unverified`, icon: Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { label: "Customers", value: stats.customers, sub: "Registered users", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "Quote leads", value: stats.quotes, sub: `${stats.newQuotes} new`, icon: Inbox, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
    { label: "Active subs", value: stats.activeSubscriptions, sub: `${stats.featuredProviders} featured · ${stats.premiumProviders} premium`, icon: Crown, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
    { label: "Total revenue", value: formatCompactINR(stats.totalRevenue), sub: "All-time subscriptions", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "Offers", value: stats.offers, sub: `${stats.activeOffers} active`, icon: Tag, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { label: "Plans", value: stats.plans, sub: "Plan configs", icon: CreditCard, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
  ];

  const recentLeads = (leadsData?.quoteRequests ?? []).slice(0, 5);
  const recentSubs = (subsData?.subscriptions ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", c.bg, c.color)}>
                <c.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-[11px] text-muted-foreground">{c.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <Inbox className="h-4 w-4 text-primary" /> Recent leads
          </h2>
          {recentLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No leads yet.</p>
          ) : (
            <div className="space-y-2">
              {recentLeads.map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <ProviderLogo name={l.provider?.companyName ?? "Provider"} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.customerName}</p>
                    <p className="truncate text-xs text-muted-foreground">{l.provider?.companyName ?? "—"} · {l.projectType}</p>
                  </div>
                  <Badge className={LEAD_STATUS_CONFIG[l.status].color}>{LEAD_STATUS_CONFIG[l.status].label}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <Crown className="h-4 w-4 text-primary" /> Recent subscriptions
          </h2>
          {recentSubs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No subscriptions yet.</p>
          ) : (
            <div className="space-y-2">
              {recentSubs.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <ProviderLogo name={s.provider?.companyName ?? "Provider"} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.provider?.companyName ?? "—"}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.planName} · {s.featureType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatINR(s.amount)}</p>
                    <Badge className={s.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-muted text-muted-foreground"}>
                      {s.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ---------- Plans & Offers ----------
function PlansTab() {
  const { data: plansData, refetch: refetchPlans } = useApi<PlansResponse>("/api/admin/plans", []);
  const { data: offersData, refetch: refetchOffers } = useApi<OffersResponse>("/api/admin/offers", []);
  const plans = plansData?.plans ?? [];
  const offers = offersData?.offers ?? [];

  return (
    <div className="space-y-6">
      {/* Plans editor */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CreditCard className="h-5 w-5 text-primary" /> Subscription plans
            </h2>
            <p className="text-sm text-muted-foreground">Edit the three per-feature prices for each plan.</p>
          </div>
        </div>
        {plans.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No plans configured.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((p) => (
              <PlanEditor key={p.id} plan={p} onSaved={refetchPlans} />
            ))}
          </div>
        )}
      </Card>

      {/* Offers management */}
      <OffersCard offers={offers} onSaved={refetchOffers} />
    </div>
  );
}

function PlanEditor({ plan, onSaved }: { plan: Plan; onSaved: () => void }) {
  const [featured, setFeatured] = useState(plan.featuredPrice);
  const [premium, setPremium] = useState(plan.premiumPrice);
  const [both, setBoth] = useState(plan.bothPrice);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await postJSON(`/api/admin/plans/${plan.id}`, {
      featuredPrice: featured,
      premiumPrice: premium,
      bothPrice: both,
    }, "PATCH");
    setSaving(false);
    if (res.ok) {
      toast.success(`${plan.name} prices updated.`);
      onSaved();
    } else {
      toast.error(res.error ?? "Failed to update plan.");
    }
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">{plan.name}</h3>
        <Badge className={plan.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-muted text-muted-foreground"}>
          {plan.active ? "Active" : "Inactive"}
        </Badge>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">{plan.durationDays} days · {plan.planType}</p>
      <div className="space-y-2">
        <Field label="Featured price (₹)">
          <Input type="number" value={featured} onChange={(e) => setFeatured(Number(e.target.value))} />
        </Field>
        <Field label="Premium price (₹)">
          <Input type="number" value={premium} onChange={(e) => setPremium(Number(e.target.value))} />
        </Field>
        <Field label="Both price (₹)">
          <Input type="number" value={both} onChange={(e) => setBoth(Number(e.target.value))} />
        </Field>
      </div>
      <Button size="sm" className="mt-3 w-full" onClick={save} disabled={saving}>
        {saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-1 h-4 w-4" /> Save prices</>}
      </Button>
    </div>
  );
}

function OffersCard({ offers, onSaved }: { offers: Offer[]; onSaved: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: 10,
    maxUses: 0,
    expiresAt: "",
    active: true,
    notifySubscribers: false,
  });
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!form.code.trim()) { toast.error("Code is required."); return; }
    setSaving(true);
    const payload: Record<string, unknown> = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      discountValue: form.discountValue,
      maxUses: form.maxUses,
      active: form.active,
      notifySubscribers: form.notifySubscribers,
    };
    if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();
    const res = await postJSON("/api/admin/offers", payload);
    setSaving(false);
    if (res.ok) {
      toast.success(`Offer ${form.code.trim().toUpperCase()} created!${form.notifySubscribers ? " Subscribers notified." : ""}`);
      setShowCreate(false);
      setForm({ code: "", description: "", discountType: "percent", discountValue: 10, maxUses: 0, expiresAt: "", active: true, notifySubscribers: false });
      onSaved();
    } else {
      toast.error(res.error ?? "Failed to create offer.");
    }
  }

  async function toggleActive(o: Offer) {
    const res = await postJSON(`/api/admin/offers/${o.id}`, { active: !o.active }, "PATCH");
    if (res.ok) {
      toast.success(`Offer ${o.code} ${o.active ? "deactivated" : "activated"}.`);
      onSaved();
    } else {
      toast.error(res.error ?? "Failed to update offer.");
    }
  }

  async function remove(o: Offer) {
    if (!confirm(`Delete offer ${o.code}? This cannot be undone.`)) return;
    const res = await postJSON(`/api/admin/offers/${o.id}`, undefined, "DELETE");
    if (res.ok) {
      toast.success(`Offer ${o.code} deleted.`);
      onSaved();
    } else {
      toast.error(res.error ?? "Failed to delete offer.");
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Tag className="h-5 w-5 text-primary" /> Promo codes
          </h2>
          <p className="text-sm text-muted-foreground">Create, toggle and delete offer codes. Notify subscribers when launching new promos.</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate((s) => !s)}>
          <Plus className="mr-1 h-4 w-4" /> New offer
        </Button>
      </div>

      {showCreate && (
        <div className="mb-5 rounded-xl border border-dashed border-amber-400/60 bg-amber-50/40 p-4 dark:bg-amber-500/5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Code *">
              <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="WELCOME50" />
            </Field>
            <Field label="Description">
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="50% off launch promo" />
            </Field>
            <Field label="Discount type">
              <Select value={form.discountType} onValueChange={(v) => setForm((f) => ({ ...f, discountType: v as "percent" | "fixed" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent (%)</SelectItem>
                  <SelectItem value="fixed">Fixed (₹)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Discount value">
              <Input type="number" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))} />
            </Field>
            <Field label="Max uses (0 = unlimited)">
              <Input type="number" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))} />
            </Field>
            <Field label="Expires at (optional)">
              <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
            </Field>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.notifySubscribers} onChange={(e) => setForm((f) => ({ ...f, notifySubscribers: e.target.checked }))} className="h-4 w-4 accent-primary" />
            <span>Notify all newsletter subscribers &amp; customers about this offer</span>
          </label>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={create} disabled={saving}>
              {saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Creating…</> : <><Send className="mr-1 h-4 w-4" /> Create offer</>}
            </Button>
          </div>
        </div>
      )}

      {offers.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No offers yet. Create your first promo code above.</p>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="hidden md:table-cell">Usage</TableHead>
                <TableHead className="hidden lg:table-cell">Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <p className="font-mono font-bold">{o.code}</p>
                    {o.description && <p className="text-xs text-muted-foreground">{o.description}</p>}
                  </TableCell>
                  <TableCell>
                    {o.discountType === "percent" ? `${o.discountValue}%` : formatINR(o.discountValue)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {o.usedCount}{o.maxUses > 0 ? ` / ${o.maxUses}` : " (unlimited)"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {o.expiresAt ? new Date(o.expiresAt).toLocaleDateString("en-IN") : "Never"}
                  </TableCell>
                  <TableCell>
                    <Badge className={o.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-muted text-muted-foreground"}>
                      {o.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => toggleActive(o)}>
                        {o.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(o)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}

// ---------- Subscriptions (immutable log) ----------
function SubscriptionsTab() {
  const { data, isLoading } = useApi<SubscriptionsResponse>("/api/admin/subscriptions", []);
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const subs = data?.subscriptions ?? [];

  function open(s: Subscription) {
    setSelected(s);
    setNotes(s.adminNotes ?? "");
  }

  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    const res = await postJSON(`/api/admin/subscriptions/${selected.id}`, { adminNotes: notes }, "PATCH");
    setSaving(false);
    if (res.ok) {
      toast.success("Dispute notes saved.");
      setSelected(null);
    } else {
      toast.error(res.error ?? "Failed to save notes.");
    }
  }

  async function cancelSub() {
    if (!selected) return;
    if (!confirm("Cancel this subscription? This will mark it as cancelled and set cancelledBy=admin.")) return;
    setSaving(true);
    const res = await postJSON(`/api/admin/subscriptions/${selected.id}`, { status: "cancelled" }, "PATCH");
    setSaving(false);
    if (res.ok) {
      toast.success("Subscription cancelled.");
      setSelected(null);
    } else {
      toast.error(res.error ?? "Failed to cancel subscription.");
    }
  }

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">
          <Shield className="mr-1 inline h-4 w-4 text-primary" />
          Subscription records are <strong>immutable</strong>. You can add dispute notes or cancel a subscription —
          amounts, plan types and feature types cannot be edited.
        </p>
      </Card>

      {subs.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">No subscriptions yet.</Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((s) => {
                  const now = new Date();
                  const end = new Date(s.endDate);
                  const remainingMs = end.getTime() - now.getTime();
                  const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <p className="font-mono text-xs">{s.transactionRef}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(s.createdAt)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">{s.provider?.companyName ?? "—"}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{s.planName}</p>
                        <p className="text-xs text-muted-foreground">{s.durationDays}d</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{s.featureType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-bold">{formatINR(s.amount)}</p>
                        {s.offerDiscount > 0 && (
                          <p className="text-xs text-emerald-600">−{formatINR(s.offerDiscount)}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.status === "active" ? (
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{remainingDays}d left</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          s.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" :
                          s.status === "cancelled" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400" :
                          "bg-muted text-muted-foreground"
                        }>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => open(s)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Dispute notes dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Subscription details</DialogTitle>
            <DialogDescription>
              {selected?.transactionRef}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Provider</p><p className="font-semibold">{selected.provider?.companyName ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Plan</p><p className="font-semibold">{selected.planName} ({selected.durationDays}d)</p></div>
                <div><p className="text-xs text-muted-foreground">Feature</p><p className="font-semibold capitalize">{selected.featureType}</p></div>
                <div><p className="text-xs text-muted-foreground">Payment method</p><p className="font-semibold">{selected.paymentMethod}</p></div>
                <div><p className="text-xs text-muted-foreground">Original amount</p><p className="font-semibold">{formatINR(selected.originalAmount)}</p></div>
                <div><p className="text-xs text-muted-foreground">Final amount</p><p className="font-bold text-primary">{formatINR(selected.amount)}</p></div>
                {selected.offerCode && (
                  <div><p className="text-xs text-muted-foreground">Offer code</p><p className="font-semibold">{selected.offerCode} (−{formatINR(selected.offerDiscount)})</p></div>
                )}
                <div><p className="text-xs text-muted-foreground">Status</p><Badge className={
                  selected.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" :
                  selected.status === "cancelled" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400" :
                  "bg-muted text-muted-foreground"
                }>{selected.status}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Start</p><p className="text-sm">{new Date(selected.startDate).toLocaleString("en-IN")}</p></div>
                <div><p className="text-xs text-muted-foreground">End</p><p className="text-sm">{new Date(selected.endDate).toLocaleString("en-IN")}</p></div>
                {selected.cancelledBy && (
                  <div><p className="text-xs text-muted-foreground">Cancelled by</p><p className="font-semibold capitalize">{selected.cancelledBy}</p></div>
                )}
              </div>
              <Separator />
              <Field label="Admin dispute notes (only editable field)">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Notes about this transaction, dispute, refund decision, etc."
                />
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            {selected?.status === "active" && (
              <Button variant="destructive" onClick={cancelSub} disabled={saving}>
                <XCircle className="mr-1 h-4 w-4" /> Cancel subscription
              </Button>
            )}
            <Button onClick={saveNotes} disabled={saving}>
              {saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-1 h-4 w-4" /> Save notes</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Providers ----------
function ProvidersTab() {
  const { data, isLoading, refetch } = useApi<AdminProvidersResponse>("/api/admin/providers", []);
  const [filter, setFilter] = useState<"all" | "pending" | "premium" | "verified">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminProvider | null>(null);

  const all = data?.providers ?? [];
  const filtered = useMemo(() => {
    switch (filter) {
      case "pending": return all.filter((p) => !p.approved);
      case "premium": return all.filter((p) => p.premium);
      case "verified": return all.filter((p) => p.verified);
      default: return all;
    }
  }, [all, filter]);

  const PAGE_SIZE = 25;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <div className="h-96 animate-pulse rounded-xl bg-muted" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {([
            { id: "all", label: "All" },
            { id: "pending", label: "Pending approval" },
            { id: "premium", label: "Premium" },
            { id: "verified", label: "Verified" },
          ] as const).map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setPage(1); }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} providers · page {page} of {totalPages}</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Rating</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="hidden lg:table-cell">Subs</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => setSelected(p)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <ProviderLogo name={p.companyName} size={32} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{p.companyName}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.email ?? "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{p.category?.name ?? "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <Star className="h-3.5 w-3.5 text-amber-500" /> {p.rating.toFixed(1)}
                      <span className="text-xs text-muted-foreground">({p.reviewsCount})</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.approved ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">Approved</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">Pending</Badge>
                      )}
                      {p.verified && <Badge className="bg-emerald-500 text-white">Verified</Badge>}
                      {p.premium && <Badge className="bg-amber-500 text-white">Premium</Badge>}
                      {p.featured && <Badge className="bg-rose-500 text-white">Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{p.subscriptionCount}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{timeAgo(p.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelected(p); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-3">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {selected && (
        <ProviderDetailDialog
          provider={selected}
          onClose={() => setSelected(null)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}

function ProviderDetailDialog({ provider, onClose, onSaved }: { provider: AdminProvider; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const openProvider = useMarketplace((s) => s.openProvider);

  async function toggle(field: "verified" | "premium" | "featured" | "approved", value: boolean) {
    setSaving(true);
    const res = await postJSON(`/api/admin/providers/${provider.id}`, { [field]: value }, "PATCH");
    setSaving(false);
    if (res.ok) {
      toast.success(`${field} ${value ? "enabled" : "disabled"} for ${provider.companyName}.`);
      onSaved();
      onClose();
    } else {
      toast.error(res.error ?? "Failed to update provider.");
    }
  }

  async function remove() {
    if (!confirm(`Delete ${provider.companyName}? This cascades to all their projects, reviews, quotes and subscriptions.`)) return;
    setSaving(true);
    const res = await postJSON(`/api/admin/providers/${provider.id}`, undefined, "DELETE");
    setSaving(false);
    if (res.ok) {
      toast.success(`${provider.companyName} deleted.`);
      onSaved();
      onClose();
    } else {
      toast.error(res.error ?? "Failed to delete provider.");
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ProviderLogo name={provider.companyName} size={36} />
            {provider.companyName}
          </DialogTitle>
          <DialogDescription>
            {provider.email ?? "No email"} · {provider.phone ?? "No phone"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Rating</p>
              <p className="font-bold">{provider.rating.toFixed(1)} ({provider.reviewsCount})</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Starting price</p>
              <p className="font-bold">{formatINR(provider.startingPrice)}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Subscriptions</p>
              <p className="font-bold">{provider.subscriptionCount}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-xs font-medium">{new Date(provider.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          </div>

          {/* Badges toggle */}
          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-3 font-bold">Flags &amp; status</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <FlagRow label="Approved (publicly visible)" checked={provider.approved} onChange={(v) => toggle("approved", v)} />
              <FlagRow label="Verified (green badge)" checked={provider.verified} onChange={(v) => toggle("verified", v)} />
              <FlagRow label="Premium" checked={provider.premium} onChange={(v) => toggle("premium", v)} />
              <FlagRow label="Featured" checked={provider.featured} onChange={(v) => toggle("featured", v)} />
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-2 flex items-center gap-2 font-bold">
              <Shield className="h-4 w-4 text-primary" /> Business documents
            </h3>
            {provider.documentUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            ) : (
              <div className="space-y-1">
                {provider.documentUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm hover:bg-accent">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <span className="flex-1 truncate">{url}</span>
                  </a>
                ))}
              </div>
            )}
            {provider.certificates.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Certificates</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {provider.certificates.map((c) => <Badge key={c} variant="secondary" className="bg-accent">{c}</Badge>)}
                </div>
              </div>
            )}
          </div>

          {/* Plan overrides */}
          {provider.planOverrides.length > 0 && (
            <div className="rounded-xl border border-border p-4">
              <h3 className="mb-2 font-bold">Per-provider pricing overrides</h3>
              <div className="space-y-1">
                {provider.planOverrides.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm">
                    <span className="capitalize">{o.planType}</span>
                    <span className="font-bold">{formatINR(o.customPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => openProvider(provider.slug)}>
            <ExternalLink className="mr-1 h-4 w-4" /> Public profile
          </Button>
          <Button variant="destructive" onClick={remove} disabled={saving}>
            <Trash2 className="mr-1 h-4 w-4" /> Delete provider
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FlagRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
        role="switch"
        aria-checked={checked}
      >
        <span className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-5",
        )} />
      </button>
    </label>
  );
}

// ---------- Customers ----------
function CustomersTab() {
  const { data, isLoading, refetch } = useApi<AdminCustomersResponse>("/api/admin/customers", []);
  const [page, setPage] = useState(1);
  const all = data?.customers ?? [];
  const PAGE_SIZE = 25;
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const pageItems = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function remove(c: AdminCustomer) {
    if (!confirm(`Delete ${c.name}? Their reviews and quote requests will stay (with customerId=null).`)) return;
    const res = await postJSON(`/api/admin/customers/${c.id}`, undefined, "DELETE");
    if (res.ok) {
      toast.success(`${c.name} deleted.`);
      refetch();
    } else {
      toast.error(res.error ?? "Failed to delete customer.");
    }
  }

  if (isLoading) return <div className="h-96 animate-pulse rounded-xl bg-muted" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{all.length} customers · page {page} of {totalPages}</p>
      </div>

      {all.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">No customers registered yet.</Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Signed in via</TableHead>
                  <TableHead className="hidden md:table-cell">Quotes</TableHead>
                  <TableHead className="hidden md:table-cell">Reviews</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <ProviderLogo name={c.name} size={32} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{c.phone ?? "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {c.googleId ? <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">Google</Badge> : <Badge variant="outline">Email</Badge>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{c.quoteCount}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{c.reviewCount}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{timeAgo(c.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(c)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border p-3">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Prev
              </Button>
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ---------- Leads ----------
function LeadsTab() {
  const { data, isLoading } = useApi<AdminLeadsResponse>("/api/admin/leads", []);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const all = data?.quoteRequests ?? [];
  const filtered = filter === "all" ? all : all.filter((l) => l.status === filter);

  if (isLoading) return <div className="h-96 animate-pulse rounded-xl bg-muted" />;

  return (
    <div className="space-y-4">
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
            {s === "all" ? "All" : LEAD_STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">No leads in this category.</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => (
            <LeadCard key={l.id} lead={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: AdminLead }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <ProviderLogo name={lead.provider?.companyName ?? "Provider"} size={40} />
          <div>
            <p className="font-semibold">{lead.customerName}</p>
            <p className="text-xs text-muted-foreground">→ {lead.provider?.companyName ?? "—"}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {timeAgo(lead.createdAt)}
            </p>
          </div>
        </div>
        <Badge className={LEAD_STATUS_CONFIG[lead.status].color}>{LEAD_STATUS_CONFIG[lead.status].label}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div><p className="text-xs text-muted-foreground">Project</p><p className="font-semibold">{lead.projectType}</p></div>
        <div><p className="text-xs text-muted-foreground">Budget</p><p className="font-semibold">{lead.budget ?? "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">Location</p><p className="font-semibold">{lead.location ?? "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">Timeline</p><p className="font-semibold">{lead.timeline ?? "—"}</p></div>
      </div>
      {lead.message && (
        <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">&ldquo;{lead.message}&rdquo;</div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {lead.customerEmail && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.customerEmail}</span>}
        {lead.customerPhone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.customerPhone}</span>}
        {lead.budget && <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> {lead.budget}</span>}
      </div>
    </Card>
  );
}

// ---------- Reports ----------
function ReportsTab() {
  const [period, setPeriod] = useState<"day" | "month" | "year">("month");
  const url = `/api/admin/revenue?period=${period}`;
  const { data, isLoading } = useApi<RevenueReport>(url, [period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <BarChart3 className="h-5 w-5 text-primary" /> Revenue report
          </h2>
          <p className="text-sm text-muted-foreground">Aggregated subscription revenue over time.</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {(["day", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="p-4">
              <Wallet className="h-5 w-5 text-emerald-500" />
              <p className="mt-2 text-2xl font-extrabold">{formatCompactINR(data.totalAmount)}</p>
              <p className="text-xs text-muted-foreground">Total revenue</p>
            </Card>
            <Card className="p-4">
              <CreditCard className="h-5 w-5 text-amber-500" />
              <p className="mt-2 text-2xl font-extrabold">{data.totalSubscriptions}</p>
              <p className="text-xs text-muted-foreground">Subscriptions</p>
            </Card>
            <Card className="p-4">
              <Trophy className="h-5 w-5 text-violet-500" />
              <p className="mt-2 text-2xl font-extrabold">{formatCompactINR(data.totalDiscount)}</p>
              <p className="text-xs text-muted-foreground">Total discounts given</p>
            </Card>
            <Card className="p-4">
              <TrendingUp className="h-5 w-5 text-rose-500" />
              <p className="mt-2 text-2xl font-extrabold">
                {data.totalSubscriptions > 0 ? formatINR(Math.round(data.totalAmount / data.totalSubscriptions)) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Avg. subscription value</p>
            </Card>
          </div>

          {/* Bar chart */}
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold">
              <BarChart3 className="h-4 w-4 text-primary" /> Revenue by {period}
            </h3>
            {data.breakdown.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No subscription data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatCompactINR(Number(v))} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: "hsl(var(--muted))" }}
                    formatter={(v: number) => formatINR(v)}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Breakdowns */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="mb-3 font-bold">By status</h3>
              <div className="space-y-2">
                {data.byStatus.map((s) => (
                  <div key={s.status} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <span className="capitalize">{s.status}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{s.count} subs</span>
                      <span className="font-bold">{formatINR(s.amount)}</span>
                    </div>
                  </div>
                ))}
                {data.byStatus.length === 0 && <p className="text-sm text-muted-foreground">No data.</p>}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="mb-3 font-bold">By feature type</h3>
              <div className="space-y-2">
                {data.byFeature.map((f) => (
                  <div key={f.feature} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <span className="capitalize">{f.feature}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{f.count} subs</span>
                      <span className="font-bold">{formatINR(f.amount)}</span>
                    </div>
                  </div>
                ))}
                {data.byFeature.length === 0 && <p className="text-sm text-muted-foreground">No data.</p>}
              </div>
            </Card>
          </div>
        </>
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

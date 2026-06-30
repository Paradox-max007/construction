"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Inbox,
  FolderOpen,
  User as UserIcon,
  LayoutDashboard,
  Loader2,
  LogIn,
  ShieldAlert,
  Save,
  Star,
  Lock,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Wallet,
  Eye,
  TrendingUp,
  Trophy,
  Loader,
  CircleDot,
} from "lucide-react";
import { motion } from "framer-motion";
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
import { ProviderLogo } from "./provider-logo";
import { useMarketplace, type CustomerDashboardTab } from "@/lib/store";
import { useApi, postJSON } from "@/hooks/use-api";
import { toast } from "sonner";
import { timeAgo, formatCompactINR } from "@/lib/format";
import type {
  CustomerMeResponse,
  CustomerQuote,
  CustomerLoginResponse,
  LeadStatus,
  ProjectStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; dot: string }> = {
  new: { label: "New", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", dot: "bg-amber-500" },
  contacted: { label: "Contacted", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400", dot: "bg-orange-500" },
  quoted: { label: "Quoted", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400", dot: "bg-violet-500" },
  won: { label: "Won", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", dot: "bg-emerald-500" },
  lost: { label: "Lost", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400", dot: "bg-rose-500" },
};

const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; pct: number; color: string }> = {
  not_started: { label: "Not started", pct: 5, color: "bg-muted-foreground" },
  in_progress: { label: "In progress", pct: 60, color: "bg-amber-500" },
  on_hold: { label: "On hold", pct: 30, color: "bg-orange-500" },
  completed: { label: "Completed", pct: 100, color: "bg-emerald-500" },
  cancelled: { label: "Cancelled", pct: 0, color: "bg-rose-500" },
};

const TABS: { id: CustomerDashboardTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "quotes", label: "My Quotes", icon: Inbox },
  { id: "projects", label: "Active Projects", icon: FolderOpen },
  { id: "profile", label: "Profile", icon: UserIcon },
];

export function CustomerDashboard() {
  const tab = useMarketplace((s) => s.customerDashboardTab);
  const setTab = useMarketplace((s) => s.setCustomerDashboardTab);
  const goBrowse = useMarketplace((s) => s.goBrowse);
  const openLogin = useMarketplace((s) => s.openCustomerLogin);
  const customerUser = useMarketplace((s) => s.customerUser);

  const { data, isLoading, refetch } = useApi<CustomerMeResponse>("/api/auth/customer/me", []);
  const c = data?.customer;

  // Not authenticated state
  if (!isLoading && !c) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Customer login required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in with your customer account to view your dashboard. You can use email/password or continue with Google.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={openLogin}>
            <LogIn className="mr-1 h-4 w-4" /> Sign in as customer
          </Button>
          <Button size="lg" variant="outline" onClick={goBrowse}>
            Browse providers
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !c) {
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

  const quotes = c.quotes ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => goBrowse({})}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Exit dashboard
        </Button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Signed in as {customerUser?.email ?? c.email}
        </span>
      </div>

      {/* Identity header */}
      <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <ProviderLogo name={c.name} size={56} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold">{c.name}</h1>
            {c.googleId && <Badge className="bg-amber-500 text-white">Google</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Quotes submitted</p>
          <p className="text-lg font-bold">{quotes.length}</p>
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
      {tab === "overview" && <OverviewTab quotes={quotes} setTab={setTab} />}
      {tab === "quotes" && <QuotesTab quotes={quotes} />}
      {tab === "projects" && <ProjectsTab quotes={quotes} />}
      {tab === "profile" && <ProfileTab onSaved={refetch} />}
    </div>
  );
}

// ---------- Overview ----------
function OverviewTab({ quotes, setTab }: { quotes: CustomerQuote[]; setTab: (t: CustomerDashboardTab) => void }) {
  const newQuotes = quotes.filter((q) => q.status === "new").length;
  const wonQuotes = quotes.filter((q) => q.status === "won").length;
  const activeProjects = quotes.filter(
    (q) => q.status === "won" && q.projectStatus && q.projectStatus !== "completed" && q.projectStatus !== "cancelled",
  ).length;

  const stats = [
    { label: "Total quotes", value: quotes.length, icon: Inbox, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { label: "Awaiting reply", value: newQuotes, icon: Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { label: "Won projects", value: wonQuotes, icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { label: "Active projects", value: activeProjects, icon: Loader, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
  ];

  return (
    <div className="space-y-6">
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
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <Inbox className="h-4 w-4 text-primary" /> Recent quote requests
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setTab("quotes")}>
              View all
            </Button>
          </div>
          {quotes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You haven&apos;t requested any quotes yet. Browse providers and request a free quote to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {quotes.slice(0, 5).map((q) => (
                <div key={q.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <ProviderLogo name={q.provider?.companyName ?? "Provider"} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{q.provider?.companyName ?? "Provider"}</p>
                    <p className="truncate text-xs text-muted-foreground">{q.projectType} · {q.location ?? "—"}</p>
                  </div>
                  <Badge className={STATUS_CONFIG[q.status].color}>{STATUS_CONFIG[q.status].label}</Badge>
                  <span className="hidden text-xs text-muted-foreground sm:block">{timeAgo(q.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 font-bold">
            <TrendingUp className="h-4 w-4 text-primary" /> Tips for getting great quotes
          </h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>Fill in budget and timeline — providers respond faster with details.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>Compare 2-3 providers using the compare tray before deciding.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>Leave an honest review after your project — it helps everyone.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>Verified providers (green badge) carry the most trust signals.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ---------- Quotes list ----------
function QuotesTab({ quotes }: { quotes: CustomerQuote[] }) {
  const [filter, setFilter] = useState<LeadStatus | "all">("all");

  const filtered = filter === "all" ? quotes : quotes.filter((q) => q.status === filter);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: quotes.length, new: 0, contacted: 0, quoted: 0, won: 0, lost: 0 };
    quotes.forEach((q) => { c[q.status]++; });
    return c;
  }, [quotes]);

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
            {s === "all" ? "All" : STATUS_CONFIG[s].label} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No quotes here</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {filter === "all"
              ? "You haven't requested any quotes yet. Find a provider and request a free quote."
              : "You have no quotes in this status. Try a different filter."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <Card key={q.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <ProviderLogo name={q.provider?.companyName ?? "Provider"} size={40} />
                  <div>
                    <p className="font-semibold">{q.provider?.companyName ?? "Provider"}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {q.location ?? "—"} · {timeAgo(q.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge className={STATUS_CONFIG[q.status].color}>
                  <span className={cn("mr-1 h-1.5 w-1.5 rounded-full", STATUS_CONFIG[q.status].dot)} />
                  {STATUS_CONFIG[q.status].label}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Project type</p>
                  <p className="font-semibold">{q.projectType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-semibold">{q.budget ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p className="font-semibold">{q.timeline ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quote ID</p>
                  <p className="truncate font-mono text-xs">{q.id.slice(-8)}</p>
                </div>
              </div>
              {q.message && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  &ldquo;{q.message}&rdquo;
                </div>
              )}
              {q.customerPhone && (
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /> Contact: {q.customerPhone}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Active projects ----------
function ProjectsTab({ quotes }: { quotes: CustomerQuote[] }) {
  const projects = quotes.filter(
    (q) => q.status === "won" && q.projectStatus && q.projectStatus !== "cancelled",
  );

  if (projects.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-12 text-center">
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No active projects</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          When a provider wins your quote and starts your project, you can track its progress here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((q) => {
        const ps = (q.projectStatus ?? "not_started") as ProjectStatus;
        const cfg = PROJECT_STATUS_CONFIG[ps];
        return (
          <Card key={q.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <ProviderLogo name={q.provider?.companyName ?? "Provider"} size={44} />
                <div>
                  <p className="font-bold">{q.provider?.companyName ?? "Provider"}</p>
                  <p className="text-xs text-muted-foreground">{q.projectType} · {q.location ?? "—"}</p>
                </div>
              </div>
              <Badge className={STATUS_CONFIG[q.status].color}>{STATUS_CONFIG[q.status].label}</Badge>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold">{cfg.label}</span>
                <span className="text-muted-foreground">{cfg.pct}%</span>
              </div>
              <Progress value={cfg.pct} className={cn("h-2", `[&>div]:${cfg.color}`)} />
            </div>
            {q.projectNotes && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3">
                <p className="mb-1 text-xs font-semibold text-muted-foreground">Provider notes</p>
                <p className="text-sm">{q.projectNotes}</p>
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-3 w-3" /> {q.budget ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {q.timeline ?? "—"}
              </span>
              {q.projectUpdatedAt && (
                <span className="inline-flex items-center gap-1">
                  <CircleDot className="h-3 w-3" /> Updated {timeAgo(q.projectUpdatedAt)}
                </span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ---------- Profile ----------
function ProfileTab({ onSaved }: { onSaved: () => void }) {
  const customerUser = useMarketplace((s) => s.customerUser);
  const setCustomerUser = useMarketplace((s) => s.setCustomerUser);
  const [name, setName] = useState(customerUser?.name ?? "");
  const [phone, setPhone] = useState(customerUser?.phone ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) { toast.error("Name cannot be empty."); return; }
    if (password && password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setSaving(true);
    const payload: Record<string, unknown> = { name: name.trim(), phone: phone.trim() };
    if (password) payload.password = password;
    const res = await postJSON<CustomerLoginResponse>(
      "/api/auth/customer/profile",
      payload,
      "PATCH",
    );
    setSaving(false);
    if (res.ok && res.data) {
      setCustomerUser(res.data.customer);
      setPassword("");
      toast.success("Profile updated successfully!");
      onSaved();
    } else {
      toast.error(res.error ?? "Failed to update profile.");
    }
  }

  const isGoogleAccount = !!customerUser?.googleId && !customerUser?.phone && !customerUser?.avatar;

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <UserIcon className="h-5 w-5 text-primary" /> Profile information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </Field>
          <Field label="Phone (required to request quotes)">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </Field>
          <Field label="Email (read-only)" className="sm:col-span-2">
            <Input value={customerUser?.email ?? ""} disabled className="bg-muted/50" />
          </Field>
        </div>
        {isGoogleAccount && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            You signed in with Google. Add a phone number so providers can reach you when you request quotes.
          </p>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
          <Lock className="h-5 w-5 text-primary" /> Change password
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Leave blank to keep your current password. New password must be at least 6 characters.
        </p>
        <Field label="New password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => { setName(customerUser?.name ?? ""); setPhone(customerUser?.phone ?? ""); setPassword(""); }}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-1 h-4 w-4" /> Save changes</>}
        </Button>
      </div>
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

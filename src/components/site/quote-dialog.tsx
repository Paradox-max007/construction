"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Send, Sparkles, Lock, User, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarketplace } from "@/lib/store";
import { postJSON } from "@/hooks/use-api";
import { toast } from "sonner";

const PROJECT_TYPES = [
  "House Construction",
  "Villa Construction",
  "Interior Design",
  "Home Renovation",
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Painting",
  "Electrical Work",
  "Plumbing",
  "Landscaping",
  "Architecture & Design",
  "Other",
];

const BUDGETS = ["Under ₹5 L", "₹5 L – ₹15 L", "₹15 L – ₹50 L", "₹50 L – ₹1 Cr", "Above ₹1 Cr"];
const TIMELINES = ["ASAP", "1–3 months", "3–6 months", "6–12 months", "Just exploring"];

export function QuoteDialog() {
  const quoteProvider = useMarketplace((s) => s.quoteProvider);
  const closeQuote = useMarketplace((s) => s.closeQuote);
  const customerUser = useMarketplace((s) => s.customerUser);
  const openCustomerLogin = useMarketplace((s) => s.openCustomerLogin);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    projectType: "",
    budget: "",
    location: "",
    timeline: "",
    message: "",
  });

  const authenticated = !!customerUser;

  function reset() {
    setForm({ projectType: "", budget: "", location: "", timeline: "", message: "" });
    setDone(false);
    setSubmitting(false);
  }

  function handleClose(open: boolean) {
    if (!open) {
      closeQuote();
      setTimeout(reset, 200);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quoteProvider || !customerUser) return;
    if (!form.projectType) {
      toast.error("Please select a project type.");
      return;
    }
    setSubmitting(true);
    const res = await postJSON("/api/quote-requests", {
      providerId: quoteProvider.id,
      projectType: form.projectType,
      budget: form.budget || undefined,
      location: form.location.trim() || undefined,
      timeline: form.timeline || undefined,
      message: form.message.trim() || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      toast.success(`Quote request sent to ${quoteProvider.name}!`);
    } else {
      // Special-case the "needPhone" error to nudge customers to their profile.
      if (res.error && /phone/i.test(res.error)) {
        toast.error("Please add a phone number to your profile before requesting quotes.");
      } else {
        toast.error(res.error ?? "Failed to send request. Try again.");
      }
    }
  }

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={!!quoteProvider} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {done ? "Request sent!" : "Request a free quote"}
          </DialogTitle>
          <DialogDescription>
            {done
              ? "Your request has been received."
              : quoteProvider
                ? `Tell ${quoteProvider.name} about your project and get a personalized quote.`
                : ""}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h3 className="text-lg font-bold">You&apos;re all set!</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {quoteProvider?.name} has been notified of your request and will respond within their typical response time.
            </p>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Done
            </Button>
          </div>
        ) : !authenticated ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15">
              <Lock className="h-8 w-8" />
            </span>
            <h3 className="text-lg font-bold">Sign in to request a quote</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              We use your customer profile to send the provider your name and contact details. Create a free customer
              account or sign in to continue.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => { closeQuote(); openCustomerLogin(); }}>
                Sign in / Create account
              </Button>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Maybe later
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identity banner pulled from the customer profile */}
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <User className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  Quoting as {customerUser.name}
                </p>
                <p className="flex items-center gap-1 truncate text-xs text-emerald-700 dark:text-emerald-400">
                  <Phone className="h-3 w-3" />
                  {customerUser.phone ?? "No phone on file"}
                  <span className="mx-1">·</span>
                  {customerUser.email}
                </p>
              </div>
            </div>
            {!customerUser.phone && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                You don&apos;t have a phone number on your profile. Add one from your customer dashboard before
                submitting — providers need it to reach you.
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Project type *">
                <Select value={form.projectType} onValueChange={(v) => set("projectType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Estimated budget">
                <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {BUDGETS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Location">
                <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City / area" />
              </Field>
              <Field label="Timeline">
                <Select value={form.timeline} onValueChange={(v) => set("timeline", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {TIMELINES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Project details">
              <Textarea
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Tell us about your project — size, scope, specific requirements…"
                rows={3}
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Sending…</> : <><Send className="mr-1 h-4 w-4" /> Send request</>}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      {children}
    </div>
  );
}

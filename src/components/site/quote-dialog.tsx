"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Send, Sparkles } from "lucide-react";
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
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    projectType: "",
    budget: "",
    location: "",
    timeline: "",
    message: "",
  });

  function reset() {
    setForm({ customerName: "", customerEmail: "", customerPhone: "", projectType: "", budget: "", location: "", timeline: "", message: "" });
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
    if (!quoteProvider) return;
    if (!form.customerName.trim() || !form.projectType) {
      toast.error("Please enter your name and project type.");
      return;
    }
    setSubmitting(true);
    const res = await postJSON("/api/quote-requests", {
      providerId: quoteProvider.id,
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim() || undefined,
      customerPhone: form.customerPhone.trim() || undefined,
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
      toast.error(res.error ?? "Failed to send request. Try again.");
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
              {quoteProvider?.name} has been notified of your request and will respond within their typical response time. We&apos;ve also saved your details for easy follow-up.
            </p>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name *">
                <Input value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Your name" required />
              </Field>
              <Field label="Phone">
                <Input value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} placeholder="+91…" />
              </Field>
            </div>
            <Field label="Email">
              <Input type="email" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} placeholder="you@email.com" />
            </Field>
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

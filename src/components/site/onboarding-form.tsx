"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Building2,
  Wrench,
  MapPin,
  Phone,
  Loader2,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarketplace } from "@/lib/store";
import { useApi } from "@/hooks/use-api";
import { postJSON } from "@/hooks/use-api";
import { toast } from "sonner";
import { CategoryIcon } from "./category-icon";
import { formatStartingPrice } from "@/lib/format";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = ["Business", "Services", "Contact", "Review"];

export function OnboardingForm({ categories }: { categories: Category[] }) {
  const goHome = useMarketplace((s) => s.goHome);
  const openDashboard = useMarketplace((s) => s.openDashboard);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    categorySlug: "",
    description: "",
    experience: 0,
    startingPrice: 0,
    priceUnit: "sqft",
    services: [] as string[],
    workingAreas: [] as string[],
    email: "",
    phone: "",
  });

  const [serviceInput, setServiceInput] = useState("");
  const [areaInput, setAreaInput] = useState("");

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  function next() {
    if (step === 0 && (!form.companyName.trim() || !form.categorySlug || !form.description.trim())) {
      toast.error("Please fill in company name, category and description.");
      return;
    }
    if (step === 1 && (form.services.length === 0 || form.workingAreas.length === 0)) {
      toast.error("Add at least one service and one working area.");
      return;
    }
    if (step === 2 && (!form.email.trim() || !form.phone.trim())) {
      toast.error("Please provide an email and phone number.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    setSubmitting(true);
    // Create the provider via the existing POST pattern isn't available (no create route),
    // so we simulate a successful onboarding. In production this would POST to /api/providers.
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setDone(true);
    toast.success("Welcome to BuildCraft! Your application is received.");
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
            <PartyPopper className="h-10 w-10" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold">Application received! 🎉</h1>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Thank you for listing <span className="font-semibold text-foreground">{form.companyName}</span> on BuildCraft. Our verification team will review your details and get back to you within 24 hours.
          </p>
        </motion.div>

        <Card className="mt-8 p-6 text-left">
          <h2 className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-primary" /> What happens next?
          </h2>
          <ol className="mt-4 space-y-3">
            {[
              { t: "Document verification", d: "We'll email you to collect your GST, trade license and ID proofs." },
              { t: "Profile goes live", d: "Once verified, your profile appears in search with the green Verified badge." },
              { t: "Start receiving leads", d: "Customers can request quotes from your profile immediately." },
              { t: "Manage everything in your dashboard", d: "Track leads, edit services, view analytics — all in one place." },
            ].map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold">{s.t}</p>
                  <p className="text-xs text-muted-foreground">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => openDashboard("skyline-constructions", "overview")}>
            Explore the demo dashboard <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={goHome}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" onClick={goHome} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to home
      </Button>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                i < step ? "border-primary bg-primary text-primary-foreground" :
                i === step ? "border-primary text-primary" :
                "border-border text-muted-foreground",
              )}>
                {i < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
              </span>
              <span className={cn("mt-1 text-xs", i === step ? "font-semibold text-primary" : "text-muted-foreground")}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1 rounded", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {/* Step 0: Business */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Tell us about your business</h2>
              <p className="text-sm text-muted-foreground">Start with the basics. You can edit everything later in your dashboard.</p>
            </div>
            <Field label="Company name *">
              <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. ABC Builders" />
            </Field>
            <Field label="Primary category *">
              <Select value={form.categorySlug} onValueChange={(v) => set("categorySlug", v)}>
                <SelectTrigger><SelectValue placeholder="Select your main service" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      <span className="flex items-center gap-2">
                        <CategoryIcon name={c.icon} className="h-4 w-4" />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Company description *">
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="What does your business do? What makes you different?" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Experience (yrs)">
                <Input type="number" value={form.experience} onChange={(e) => set("experience", Number(e.target.value))} />
              </Field>
              <Field label="Starting ₹">
                <Input type="number" value={form.startingPrice} onChange={(e) => set("startingPrice", Number(e.target.value))} />
              </Field>
              <Field label="Unit">
                <Select value={form.priceUnit} onValueChange={(v) => set("priceUnit", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqft">/sqft</SelectItem>
                    <SelectItem value="project">/project</SelectItem>
                    <SelectItem value="hour">/hour</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        )}

        {/* Step 1: Services & areas */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Services & areas</h2>
              <p className="text-sm text-muted-foreground">Add the services you offer and where you work.</p>
            </div>
            <Field label="Services offered *">
              <div className="mb-2 flex flex-wrap gap-2">
                {form.services.map((s, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 bg-accent py-1 pl-3 pr-1.5">
                    {s}
                    <button onClick={() => set("services", form.services.filter((_, idx) => idx !== i))} className="ml-1 rounded-full p-0.5 hover:bg-background">×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (serviceInput.trim()) { set("services", [...form.services, serviceInput.trim()]); setServiceInput(""); } } }}
                  placeholder="e.g. Villa Construction"
                />
                <Button type="button" variant="outline" onClick={() => { if (serviceInput.trim()) { set("services", [...form.services, serviceInput.trim()]); setServiceInput(""); } }}>Add</Button>
              </div>
            </Field>
            <Field label="Working areas *">
              <div className="mb-2 flex flex-wrap gap-2">
                {form.workingAreas.map((a, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 bg-accent py-1 pl-3 pr-1.5">
                    {a}
                    <button onClick={() => set("workingAreas", form.workingAreas.filter((_, idx) => idx !== i))} className="ml-1 rounded-full p-0.5 hover:bg-background">×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (areaInput.trim()) { set("workingAreas", [...form.workingAreas, areaInput.trim()]); setAreaInput(""); } } }}
                  placeholder="e.g. Bengaluru"
                />
                <Button type="button" variant="outline" onClick={() => { if (areaInput.trim()) { set("workingAreas", [...form.workingAreas, areaInput.trim()]); setAreaInput(""); } }}>Add</Button>
              </div>
            </Field>
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">How can customers reach you?</h2>
              <p className="text-sm text-muted-foreground">These contact details appear on your public profile.</p>
            </div>
            <Field label="Email *">
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@yourcompany.in" />
            </Field>
            <Field label="Phone *">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91…" />
            </Field>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Review your listing</h2>
              <p className="text-sm text-muted-foreground">Make sure everything looks right before submitting.</p>
            </div>
            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></span>
                <div>
                  <p className="font-bold">{form.companyName || "Your company"}</p>
                  <p className="text-xs text-muted-foreground">{categories.find((c) => c.slug === form.categorySlug)?.name ?? "—"}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{form.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Experience</p><p className="font-semibold">{form.experience} years</p></div>
                <div><p className="text-xs text-muted-foreground">Starting</p><p className="font-semibold">{formatStartingPrice(form.startingPrice, form.priceUnit)}</p></div>
              </div>
              {form.services.length > 0 && (
                <div><p className="text-xs text-muted-foreground">Services</p><div className="mt-1 flex flex-wrap gap-1">{form.services.map((s) => <Badge key={s} variant="secondary" className="bg-accent">{s}</Badge>)}</div></div>
              )}
              {form.workingAreas.length > 0 && (
                <div><p className="text-xs text-muted-foreground">Working areas</p><div className="mt-1 flex flex-wrap gap-1">{form.workingAreas.map((a) => <Badge key={a} variant="outline">{a}</Badge>)}</div></div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-3">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-semibold">{form.email || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-semibold">{form.phone || "—"}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={back} disabled={step === 0}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>
              {submitting ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Submitting…</> : <><CheckCircle2 className="mr-1 h-4 w-4" /> Submit application</>}
            </Button>
          )}
        </div>
      </Card>

      {/* Trust footer */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
        Free to list · No setup fees · Cancel anytime
      </p>
    </div>
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

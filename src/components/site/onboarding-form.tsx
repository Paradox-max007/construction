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
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  PartyPopper,
  Sparkles,
  LayoutDashboard,
  AlertCircle,
  FileText,
  ShieldCheck,
  Plus,
  X,
  ExternalLink,
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
import { postJSON } from "@/hooks/use-api";
import { toast } from "sonner";
import { CategoryIcon } from "./category-icon";
import { formatStartingPrice } from "@/lib/format";
import type { Category, LoginResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = ["Business", "Services", "Contact", "Documents", "Account", "Review"];

export function OnboardingForm({ categories }: { categories: Category[] }) {
  const goHome = useMarketplace((s) => s.goHome);
  const openDashboard = useMarketplace((s) => s.openDashboard);
  const openLogin = useMarketplace((s) => s.openLogin);
  const setAuthUser = useMarketplace((s) => s.setAuthUser);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    categorySlug: "",
    description: "",
    experience: 0,
    startingPrice: 0,
    priceUnit: "sqft",
    services: [] as string[],
    workingAreas: [] as string[],
    certificates: [] as string[],
    documentUrls: [] as string[],
    officeAddress: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [serviceInput, setServiceInput] = useState("");
  const [areaInput, setAreaInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [docInput, setDocInput] = useState("");

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  function next() {
    // Step 0: Business
    if (step === 0) {
      if (!form.companyName.trim()) return toast.error("Company name is required.");
      if (!form.categorySlug) return toast.error("Please select a category.");
      if (form.description.trim().length < 20) return toast.error("Description must be at least 20 characters.");
    }
    // Step 1: Services
    if (step === 1) {
      if (form.services.length === 0) return toast.error("Add at least one service.");
      if (form.workingAreas.length === 0) return toast.error("Add at least one working area.");
    }
    // Step 2: Contact
    if (step === 2) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return toast.error("Please enter a valid email.");
      if (form.phone.trim().length < 6) return toast.error("Please enter a valid phone number.");
    }
    // Step 3: Documents
    if (step === 3) {
      if (form.documentUrls.length === 0) return toast.error("At least one business document URL is required for verification.");
    }
    // Step 4: Account
    if (step === 4) {
      if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
      if (form.password !== form.confirmPassword) return toast.error("Passwords do not match.");
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    setSubmitting(true);
    const res = await postJSON<LoginResponse>("/api/auth/register", {
      companyName: form.companyName.trim(),
      categorySlug: form.categorySlug,
      description: form.description.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      services: form.services,
      workingAreas: form.workingAreas,
      certificates: form.certificates,
      documentUrls: form.documentUrls,
      experience: form.experience,
      startingPrice: form.startingPrice,
      priceUnit: form.priceUnit,
      officeAddress: form.officeAddress.trim() || undefined,
    });
    setSubmitting(false);
    if (res.ok && res.data) {
      setAuthUser(res.data.provider);
      setCreatedSlug(res.data.provider.slug);
      setDone(true);
      toast.success("Account created! Welcome to BuildCraft.");
    } else {
      toast.error(res.error ?? "Registration failed. Please try again.");
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
            <PartyPopper className="h-10 w-10" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold">Account created! 🎉</h1>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Welcome to BuildCraft, <span className="font-semibold text-foreground">{form.companyName}</span>. Your provider
            account has been created and is now <strong>pending admin approval</strong>. You can finish setting up your
            profile from your dashboard in the meantime.
          </p>
        </motion.div>

        <Card className="mt-8 p-6 text-left">
          <h2 className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-primary" /> What happens next?
          </h2>
          <ol className="mt-4 space-y-3">
            {[
              { t: "Complete your profile", d: "Add a cover image, logo, certificates and pricing packages from your dashboard." },
              { t: "Admin review", d: "Our team reviews your submitted business documents. You'll get the Verified badge once approved." },
              { t: "Go public", d: "Once approved, your profile appears in marketplace searches and customers can request quotes." },
              { t: "Boost your reach", d: "Subscribe to Featured or Premium plans from your dashboard to appear higher in results." },
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
          <Button size="lg" onClick={() => openDashboard(createdSlug ?? "skyline-constructions", "overview")}>
            <LayoutDashboard className="mr-1 h-4 w-4" /> Go to my dashboard
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
              <span className={cn("mt-1 hidden text-xs sm:block", i === step ? "font-semibold text-primary" : "text-muted-foreground")}>{label}</span>
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
            <Field label="Company description * (min 20 characters)">
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="What does your business do? What makes you different? Describe your services and experience." />
              <p className="mt-1 text-xs text-muted-foreground">{form.description.length} / 20 characters minimum</p>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Experience (yrs)">
                <Input type="number" min={0} value={form.experience} onChange={(e) => set("experience", Number(e.target.value))} />
              </Field>
              <Field label="Starting ₹">
                <Input type="number" min={0} value={form.startingPrice} onChange={(e) => set("startingPrice", Number(e.target.value))} />
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
              <p className="text-sm text-muted-foreground">Add the services you offer and where you work. Customers search by these.</p>
            </div>
            <Field label="Services offered * (add at least one)">
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
            <Field label="Working areas * (add at least one city)">
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
            <Field label="Office address (optional)">
              <Input value={form.officeAddress} onChange={(e) => set("officeAddress", e.target.value)} placeholder="Your business address" />
            </Field>
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">How can customers reach you?</h2>
              <p className="text-sm text-muted-foreground">These contact details appear on your public profile. Your email is also used for login.</p>
            </div>
            <Field label="Email * (this is your login email)">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@yourcompany.in" className="pl-9" />
              </div>
            </Field>
            <Field label="Phone *">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" className="pl-9" />
              </div>
            </Field>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Business documents
              </h2>
              <p className="text-sm text-muted-foreground">
                Paste URLs to your business registration, GST certificate, trade license or ID proofs. At least one is
                required for verification. Our admin team will review these before approving your profile.
              </p>
            </div>

            <Field label="Document URLs * (add at least one)">
              <div className="mb-2 space-y-2">
                {form.documentUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-sm text-primary hover:underline">
                      {url}
                    </a>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    <button onClick={() => set("documentUrls", form.documentUrls.filter((_, idx) => idx !== i))} className="rounded-full p-1 hover:bg-muted">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {form.documentUrls.length === 0 && (
                  <p className="text-xs text-muted-foreground">No documents added yet.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={docInput}
                  onChange={(e) => setDocInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (docInput.trim()) { set("documentUrls", [...form.documentUrls, docInput.trim()]); setDocInput(""); } } }}
                  placeholder="https://drive.google.com/.../gst-certificate.pdf"
                />
                <Button type="button" variant="outline" onClick={() => { if (docInput.trim()) { set("documentUrls", [...form.documentUrls, docInput.trim()]); setDocInput(""); } }}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </Field>

            <Field label="Certificates & licenses (optional tag names)">
              <p className="mb-2 text-xs text-muted-foreground">Add named tags like “GST Registered”, “ISO 9001”, “BBMP Licensed”.</p>
              <div className="mb-2 flex flex-wrap gap-2">
                {form.certificates.map((c, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 bg-accent py-1 pl-3 pr-1.5">
                    {c}
                    <button onClick={() => set("certificates", form.certificates.filter((_, idx) => idx !== i))} className="ml-1 rounded-full p-0.5 hover:bg-background">×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (certInput.trim()) { set("certificates", [...form.certificates, certInput.trim()]); setCertInput(""); } } }}
                  placeholder="e.g. GST Registered"
                />
                <Button type="button" variant="outline" onClick={() => { if (certInput.trim()) { set("certificates", [...form.certificates, certInput.trim()]); setCertInput(""); } }}>Add</Button>
              </div>
            </Field>

            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
              Your profile will be created with <strong>approved: false</strong> and will not appear in public searches
              until an admin verifies your documents and approves it.
            </div>
          </div>
        )}

        {/* Step 4: Account / password */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Create your login credentials</h2>
              <p className="text-sm text-muted-foreground">Set a password to secure your provider dashboard. You&apos;ll use this with your email to log in.</p>
            </div>
            <Field label="Password * (min 6 characters)">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Create a password"
                  className="pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </Field>
            <Field label="Confirm password *">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  placeholder="Re-enter your password"
                  className="pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" /> Passwords do not match
                </p>
              )}
              {form.confirmPassword.length > 0 && form.password === form.confirmPassword && (
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Passwords match
                </p>
              )}
            </Field>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
              Your password is securely hashed and stored. Never share it with anyone.
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Review & submit</h2>
              <p className="text-sm text-muted-foreground">Make sure everything looks right. After submitting, you&apos;ll be logged in automatically.</p>
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
                <div><p className="text-xs text-muted-foreground">Login email</p><p className="font-semibold truncate">{form.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-semibold">{form.phone}</p></div>
              </div>
              {form.services.length > 0 && (
                <div><p className="text-xs text-muted-foreground">Services ({form.services.length})</p><div className="mt-1 flex flex-wrap gap-1">{form.services.map((s) => <Badge key={s} variant="secondary" className="bg-accent">{s}</Badge>)}</div></div>
              )}
              {form.workingAreas.length > 0 && (
                <div><p className="text-xs text-muted-foreground">Working areas ({form.workingAreas.length})</p><div className="mt-1 flex flex-wrap gap-1">{form.workingAreas.map((a) => <Badge key={a} variant="outline">{a}</Badge>)}</div></div>
              )}
              {form.certificates.length > 0 && (
                <div><p className="text-xs text-muted-foreground">Certificates ({form.certificates.length})</p><div className="mt-1 flex flex-wrap gap-1">{form.certificates.map((c) => <Badge key={c} variant="outline">{c}</Badge>)}</div></div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Documents ({form.documentUrls.length})</p>
                <div className="mt-1 space-y-1">
                  {form.documentUrls.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-primary hover:underline">
                      <FileText className="mr-1 inline h-3 w-3" />{u}
                    </a>
                  ))}
                </div>
              </div>
              {form.officeAddress && (
                <div><p className="text-xs text-muted-foreground">Office address</p><p className="text-sm font-medium">{form.officeAddress}</p></div>
              )}
              <div className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground">Account</p>
                <p className="text-sm font-medium">Password set ✓ · Login via {form.email}</p>
              </div>
            </div>
            <div className="rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
              After submission, your account is created with approved:false (pending review). You&apos;ll be logged in to your dashboard instantly.
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
              {submitting ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Creating account…</> : <><CheckCircle2 className="mr-1 h-4 w-4" /> Create my account</>}
            </Button>
          )}
        </div>
      </Card>

      {/* Footer */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <button onClick={openLogin} className="font-semibold text-primary hover:underline">
          Log in instead
        </button>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
        Free to list · No setup fees · Cancel anytime
      </p>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (password.length === 0) return null;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];
  const idx = Math.min(score, 5) - 1;
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex h-1.5 flex-1 gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("h-full flex-1 rounded-full transition-colors", i <= idx ? colors[idx] : "bg-muted")} />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{labels[Math.max(0, idx)]}</span>
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

"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Star, MessageSquarePlus, Lock, BadgeCheck, User } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

export function ReviewDialog() {
  const reviewProvider = useMarketplace((s) => s.reviewProvider);
  const closeReview = useMarketplace((s) => s.closeReview);
  const customerUser = useMarketplace((s) => s.customerUser);
  const openCustomerLogin = useMarketplace((s) => s.openCustomerLogin);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  const [form, setForm] = useState({
    title: "",
    review: "",
    projectType: "",
  });

  const authenticated = !!customerUser;

  function reset() {
    setForm({ title: "", review: "", projectType: "" });
    setRating(5);
    setHover(0);
    setDone(false);
    setSubmitting(false);
  }

  function handleClose(open: boolean) {
    if (!open) {
      closeReview();
      setTimeout(reset, 200);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewProvider || !customerUser) return;
    if (!form.review.trim()) {
      toast.error("Please write your review.");
      return;
    }
    setSubmitting(true);
    const res = await postJSON("/api/reviews", {
      providerId: reviewProvider.id,
      rating,
      title: form.title.trim() || undefined,
      review: form.review.trim(),
      projectType: form.projectType || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      toast.success("Review submitted! Thank you for your feedback.");
    } else {
      toast.error(res.error ?? "Failed to submit review. Try again.");
    }
  }

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const displayRating = hover || rating;

  return (
    <Dialog open={!!reviewProvider} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            {done ? "Review published!" : "Write a review"}
          </DialogTitle>
          <DialogDescription>
            {done
              ? "Thank you for sharing your experience."
              : reviewProvider
                ? `Share your experience working with ${reviewProvider.name}.`
                : ""}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h3 className="text-lg font-bold">Thanks for your review!</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your verified review has been added and the provider&apos;s rating has been updated. Verified reviews
              help the whole community choose with confidence.
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
            <h3 className="text-lg font-bold">Sign in to write a review</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Reviews are tied to your customer account so we can verify them. Create a free customer account or sign
              in to continue.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => { closeReview(); openCustomerLogin(); }}>
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
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Reviewing as {customerUser.name}</p>
                <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                  <BadgeCheck className="h-3 w-3" /> Verified customer review
                </p>
              </div>
            </div>

            {/* Star selector */}
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your rating</p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="transition-transform hover:scale-110"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        n <= displayRating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30",
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-semibold text-primary">
                {["", "Poor", "Fair", "Good", "Very good", "Excellent"][displayRating]}
              </p>
            </div>

            <Field label="Project type">
              <Select value={form.projectType} onValueChange={(v) => set("projectType", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Review title">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Summarize your experience" />
            </Field>
            <Field label="Your review *">
              <Textarea
                value={form.review}
                onChange={(e) => set("review", e.target.value)}
                placeholder="What did you like? What could be better? Would you recommend them?"
                rows={4}
                required
              />
            </Field>
            <p className="text-xs text-muted-foreground">
              Reviews are most helpful when they&apos;re honest and specific. Your name will be shown with your review.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Submitting…</> : "Submit review"}
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

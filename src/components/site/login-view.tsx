"use client";

import { useState } from "react";
import {
  ArrowLeft,
  HardHat,
  Lock,
  Mail,
  Loader2,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMarketplace } from "@/lib/store";
import { postJSON } from "@/hooks/use-api";
import { toast } from "sonner";
import type { LoginResponse } from "@/lib/types";

const DEMO_ACCOUNTS = [
  { email: "hello@skylineconstructions.in", name: "Skyline Constructions", category: "House Construction" },
  { email: "design@luxeinteriors.in", name: "Luxe Interiors Studio", category: "Interior Design" },
  { email: "studio@spacecraftarch.in", name: "SpaceCraft Architects", category: "Architecture" },
];

export function LoginView() {
  const goHome = useMarketplace((s) => s.goHome);
  const openOnboarding = useMarketplace((s) => s.openOnboarding);
  const openDashboard = useMarketplace((s) => s.openDashboard);
  const setAuthUser = useMarketplace((s) => s.setAuthUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await postJSON<LoginResponse>("/api/auth/login", { email: email.trim(), password });
    setLoading(false);
    if (res.ok && res.data) {
      setAuthUser(res.data.provider);
      toast.success(`Welcome back, ${res.data.provider.companyName}!`);
      openDashboard(res.data.provider.slug, "overview");
    } else {
      setError(res.error ?? "Login failed. Please try again.");
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError(null);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center px-4 py-8 sm:px-6">
      <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">
        {/* Left: brand / pitch */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HardHat className="h-6 w-6" />
            </span>
            <span className="text-2xl font-extrabold">
              Build<span className="text-primary">Craft</span>
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight">
            Welcome back to your <span className="text-primary">provider dashboard</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Log in to manage your leads, update your services, track analytics and grow your construction business.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              { icon: ShieldCheck, t: "Secure access", d: "Your dashboard is protected with password login." },
              { icon: Sparkles, t: "Manage everything", d: "Leads, services, pricing, analytics — all in one place." },
              { icon: LogIn, t: "Pick up where you left off", d: "Your profile and leads are saved between sessions." },
            ].map((f) => (
              <li key={f.t} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{f.t}</p>
                  <p className="text-sm text-muted-foreground">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: login form */}
        <div>
          <Button variant="ghost" size="sm" onClick={goHome} className="mb-4 lg:hidden">
            <ArrowLeft className="mr-1 h-4 w-4" /> Home
          </Button>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="p-6 sm:p-8">
              <div className="mb-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary lg:hidden">
                  <HardHat className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-2xl font-bold lg:mt-0">Provider login</h2>
                <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.in"
                      className="h-11 pl-9"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 pl-9 pr-10"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Signing in…</>
                  ) : (
                    <><LogIn className="mr-1 h-4 w-4" /> Sign in to dashboard</>
                  )}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">DEMO ACCOUNTS</span>
                <Separator className="flex-1" />
              </div>

              <p className="mb-2 text-center text-xs text-muted-foreground">
                Click an account to auto-fill · password is <code className="rounded bg-muted px-1 py-0.5 font-mono">demo1234</code>
              </p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((d) => (
                  <button
                    key={d.email}
                    onClick={() => fillDemo(d.email)}
                    className="flex w-full items-center justify-between rounded-lg border border-border p-2.5 text-left transition-colors hover:border-primary hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{d.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{d.email}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {d.category}
                    </span>
                  </button>
                ))}
              </div>

              <Separator className="my-5" />

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button onClick={openOnboarding} className="font-semibold text-primary hover:underline">
                  Register your business
                </button>
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

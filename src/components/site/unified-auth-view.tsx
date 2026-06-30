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
  User,
  Phone,
  Building2,
  ShieldAlert,
  UserCog,
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
import type {
  LoginResponse,
  CustomerLoginResponse,
  AdminLoginResponse,
} from "@/lib/types";
import { GoogleSignInButton } from "./google-sign-in-button";

const DEMO_PROVIDER_ACCOUNTS = [
  { email: "hello@skylineconstructions.in", name: "Skyline Constructions", category: "House Construction" },
  { email: "design@luxeinteriors.in", name: "Luxe Interiors Studio", category: "Interior Design" },
  { email: "studio@spacecraftarch.in", name: "SpaceCraft Architects", category: "Architecture" },
];

const ADMIN_HINT = { email: "buildcraft@gmail.com", password: "admin123" };

export function UnifiedAuthView() {
  const goHome = useMarketplace((s) => s.goHome);
  const openOnboarding = useMarketplace((s) => s.openOnboarding);
  const openDashboard = useMarketplace((s) => s.openDashboard);
  const openCustomerDashboard = useMarketplace((s) => s.openCustomerDashboard);
  const openAdminDashboard = useMarketplace((s) => s.openAdminDashboard);
  const setAuthUser = useMarketplace((s) => s.setAuthUser);
  const setCustomerUser = useMarketplace((s) => s.setCustomerUser);
  const setAdminUser = useMarketplace((s) => s.setAdminUser);
  const loginRole = useMarketplace((s) => s.loginRole);
  const setLoginRole = useMarketplace((s) => s.setLoginRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  function reset() {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setError(null);
  }

  async function tryAdminLogin(em: string, pw: string): Promise<boolean> {
    const res = await postJSON<AdminLoginResponse>("/api/auth/admin/login", {
      email: em,
      password: pw,
    });
    if (res.ok && res.data) {
      setAdminUser(res.data.admin);
      toast.success(`Welcome back, ${res.data.admin.name} (admin)!`);
      openAdminDashboard();
      return true;
    }
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (loginRole === "customer") {
      if (mode === "register") {
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        const res = await postJSON<CustomerLoginResponse>(
          "/api/auth/customer/register",
          { name: name.trim(), email: email.trim(), password, phone: phone.trim() || undefined },
        );
        setLoading(false);
        if (res.ok && res.data) {
          setCustomerUser(res.data.customer);
          toast.success(`Welcome to BuildCraft, ${res.data.customer.name}!`);
          openCustomerDashboard("overview");
        } else {
          setError(res.error ?? "Registration failed. Please try again.");
        }
        return;
      }

      // Customer login — fall back to admin if customer login returns 401.
      const res = await postJSON<CustomerLoginResponse>("/api/auth/customer/login", {
        email: email.trim(),
        password,
      });
      if (res.ok && res.data) {
        setCustomerUser(res.data.customer);
        toast.success(`Welcome back, ${res.data.customer.name}!`);
        openCustomerDashboard("overview");
        setLoading(false);
        return;
      }
      // Try admin fallback
      const adminOk = await tryAdminLogin(email.trim(), password);
      setLoading(false);
      if (!adminOk) {
        setError(res.error ?? "Invalid email or password.");
      }
      return;
    }

    // Provider login — fall back to admin if provider login returns 401.
    const res = await postJSON<LoginResponse>("/api/auth/login", {
      email: email.trim(),
      password,
    });
    if (res.ok && res.data) {
      setAuthUser(res.data.provider);
      toast.success(`Welcome back, ${res.data.provider.companyName}!`);
      openDashboard(res.data.provider.slug, "overview");
      setLoading(false);
      return;
    }
    const adminOk = await tryAdminLogin(email.trim(), password);
    setLoading(false);
    if (!adminOk) {
      setError(res.error ?? "Invalid email or password.");
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError(null);
  }

  function fillAdmin() {
    setLoginRole("customer");
    setEmail(ADMIN_HINT.email);
    setPassword(ADMIN_HINT.password);
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
            One sign-in for <span className="text-primary">everyone</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Customers manage quotes and reviews. Providers manage leads and subscriptions. Admins run the marketplace.
            All from a single, secure login.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              { icon: ShieldCheck, t: "Three secure sessions", d: "Customer, provider and admin can all be logged in at the same time." },
              { icon: Sparkles, t: "Seamless switching", d: "Switch between dashboards from the header — no re-login needed." },
              { icon: UserCog, t: "Role-aware features", d: "Each role sees only the tools that matter to them." },
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

        {/* Right: auth card */}
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
                <h2 className="mt-4 text-2xl font-bold lg:mt-0">Welcome to BuildCraft</h2>
                <p className="mt-1 text-sm text-muted-foreground">Sign in or create an account to continue</p>
              </div>

              {/* Role tabs */}
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                <button
                  type="button"
                  onClick={() => { setLoginRole("customer"); reset(); }}
                  className={
                    "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors " +
                    (loginRole === "customer" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
                  }
                >
                  <User className="h-4 w-4" /> Customer
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginRole("provider"); setMode("login"); reset(); }}
                  className={
                    "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors " +
                    (loginRole === "provider" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
                  }
                >
                  <Building2 className="h-4 w-4" /> Provider
                </button>
              </div>

              {/* Customer mode toggle (login/register) */}
              {loginRole === "customer" && (
                <div className="mb-4 flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => { setMode("login"); reset(); }}
                    className={"rounded-full px-3 py-1 font-semibold " + (mode === "login" ? "bg-primary/10 text-primary" : "text-muted-foreground")}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("register"); reset(); }}
                    className={"rounded-full px-3 py-1 font-semibold " + (mode === "register" ? "bg-primary/10 text-primary" : "text-muted-foreground")}
                  >
                    Create account
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {loginRole === "customer" && mode === "register" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold">Full name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-11 pl-9" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-semibold">Phone (optional, but needed to request quotes)</Label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="h-11 pl-9" />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
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
                    <><LogIn className="mr-1 h-4 w-4" /> {loginRole === "customer" && mode === "register" ? "Create account" : "Sign in"}</>
                  )}
                </Button>
              </form>

              {loginRole === "customer" && mode === "login" && (
                <>
                  <div className="my-5 flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                  </div>
                  <GoogleSignInButton />
                </>
              )}

              {loginRole === "provider" && (
                <>
                  <div className="my-5 flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">DEMO PROVIDER ACCOUNTS</span>
                    <Separator className="flex-1" />
                  </div>
                  <p className="mb-2 text-center text-xs text-muted-foreground">
                    Click an account to auto-fill · password is <code className="rounded bg-muted px-1 py-0.5 font-mono">demo1234</code>
                  </p>
                  <div className="space-y-2">
                    {DEMO_PROVIDER_ACCOUNTS.map((d) => (
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
                    Don&apos;t have a provider account?{" "}
                    <button onClick={openOnboarding} className="font-semibold text-primary hover:underline">
                      Register your business
                    </button>
                  </p>
                </>
              )}

              {loginRole === "customer" && mode === "login" && (
                <>
                  <div className="my-5 flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">ADMIN</span>
                    <Separator className="flex-1" />
                  </div>
                  <button
                    type="button"
                    onClick={fillAdmin}
                    className="flex w-full items-center gap-3 rounded-lg border border-dashed border-amber-400/60 bg-amber-50/50 p-3 text-left transition-colors hover:bg-amber-50 dark:bg-amber-500/5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                      <ShieldAlert className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Admin quick-fill</p>
                      <p className="text-xs text-muted-foreground">buildcraft@gmail.com · admin123</p>
                    </div>
                    <span className="text-xs text-amber-700">Fill</span>
                  </button>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

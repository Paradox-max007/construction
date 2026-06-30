"use client";

import { useState } from "react";
import {
  HardHat,
  Search,
  Menu,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Shield,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMarketplace } from "@/lib/store";
import { CategoryIcon } from "./category-icon";
import type { Category } from "@/lib/types";

export function Header({ categories }: { categories: Category[] }) {
  const goHome = useMarketplace((s) => s.goHome);
  const goBrowse = useMarketplace((s) => s.goBrowse);
  const view = useMarketplace((s) => s.view);
  const openOnboarding = useMarketplace((s) => s.openOnboarding);
  const openCustomerLogin = useMarketplace((s) => s.openCustomerLogin);
  const requireDashboard = useMarketplace((s) => s.requireDashboard);
  const openCustomerDashboard = useMarketplace((s) => s.openCustomerDashboard);
  const openAdminDashboard = useMarketplace((s) => s.openAdminDashboard);

  const authUser = useMarketplace((s) => s.authUser);
  const customerUser = useMarketplace((s) => s.customerUser);
  const adminUser = useMarketplace((s) => s.adminUser);
  const logout = useMarketplace((s) => s.logout);
  const customerLogout = useMarketplace((s) => s.customerLogout);
  const adminLogout = useMarketplace((s) => s.adminLogout);

  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const anyUser = authUser || customerUser || adminUser;

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    goBrowse({ search: query.trim(), categorySlug: null });
    setMobileOpen(false);
  }

  async function doLogoutAll() {
    // Fire all three logout endpoints in parallel; clear all state regardless.
    await Promise.allSettled([
      fetch("/api/auth/logout", { method: "POST" }),
      fetch("/api/auth/customer/logout", { method: "POST" }),
      fetch("/api/auth/admin/logout", { method: "POST" }),
    ]);
    logout();
    customerLogout();
    adminLogout();
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button onClick={goHome} className="flex shrink-0 items-center gap-2" aria-label="BuildCraft home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <HardHat className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Build<span className="text-primary">Craft</span>
          </span>
        </button>

        {/* Categories dropdown (desktop) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden md:inline-flex">
              Categories <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Browse by category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => goBrowse({ categorySlug: c.slug, search: "" })}
                className="gap-2"
              >
                <CategoryIcon name={c.icon} className="h-4 w-4 text-primary" />
                <span>{c.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search (desktop) */}
        <form onSubmit={submitSearch} className="hidden flex-1 items-center md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search builders, architects, electricians…"
              className="h-10 rounded-full pl-9 pr-4"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={view === "browse" ? "default" : "ghost"}
            size="sm"
            onClick={() => goBrowse({ categorySlug: null, search: "" })}
            className="hidden sm:inline-flex"
          >
            Browse
          </Button>

          {/* Admin dashboard shortcut */}
          {adminUser && (
            <Button
              size="sm"
              variant={view === "admin-dashboard" ? "default" : "outline"}
              onClick={openAdminDashboard}
              className="hidden md:inline-flex"
              title="Admin dashboard"
            >
              <Shield className="mr-1 h-4 w-4" /> Admin
            </Button>
          )}

          {/* Provider dashboard shortcut */}
          {authUser && (
            <Button
              size="sm"
              variant={view === "dashboard" ? "default" : "outline"}
              onClick={requireDashboard}
              className="hidden md:inline-flex"
              title="Provider dashboard"
            >
              <Building2 className="mr-1 h-4 w-4" /> {authUser.companyName}
            </Button>
          )}

          {/* Customer dashboard shortcut */}
          {customerUser && (
            <Button
              size="sm"
              variant={view === "customer-dashboard" ? "default" : "outline"}
              onClick={() => openCustomerDashboard("overview")}
              className="hidden md:inline-flex"
              title="My dashboard"
            >
              <User className="mr-1 h-4 w-4" /> {customerUser.name.split(" ")[0]}
            </Button>
          )}

          {anyUser ? (
            <Button
              size="sm"
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={doLogoutAll}
            >
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="hidden sm:inline-flex" onClick={openCustomerLogin}>
              <LogIn className="mr-1 h-4 w-4" /> Login
            </Button>
          )}
          <Button size="sm" className="hidden sm:inline-flex" onClick={openOnboarding}>
            List your business
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[380px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <HardHat className="h-4 w-4" />
                  </span>
                  BuildCraft
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-3 px-1">
                <form onSubmit={submitSearch} className="flex items-center">
                  <div className="relative w-full">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search providers…"
                      className="h-10 rounded-full pl-9"
                    />
                  </div>
                </form>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    goBrowse({ categorySlug: null, search: "" });
                    setMobileOpen(false);
                  }}
                >
                  Browse all providers
                </Button>
                <p className="px-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Categories
                </p>
                <div className="flex flex-col">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        goBrowse({ categorySlug: c.slug, search: "" });
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-accent"
                    >
                      <CategoryIcon name={c.icon} className="h-4 w-4 text-primary" />
                      {c.name}
                    </button>
                  ))}
                </div>

                <p className="px-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dashboards
                </p>
                {adminUser && (
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => { openAdminDashboard(); setMobileOpen(false); }}
                  >
                    <Shield className="mr-1 h-4 w-4" /> Admin panel
                  </Button>
                )}
                {authUser ? (
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => { requireDashboard(); setMobileOpen(false); }}
                  >
                    <Building2 className="mr-1 h-4 w-4" /> Provider · {authUser.companyName}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => { requireDashboard(); setMobileOpen(false); }}
                  >
                    <LayoutDashboard className="mr-1 h-4 w-4" /> Provider dashboard
                  </Button>
                )}
                {customerUser ? (
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => { openCustomerDashboard("overview"); setMobileOpen(false); }}
                  >
                    <User className="mr-1 h-4 w-4" /> Customer · {customerUser.name}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => { openCustomerLogin(); setMobileOpen(false); }}
                  >
                    <LogIn className="mr-1 h-4 w-4" /> Customer login
                  </Button>
                )}

                {anyUser ? (
                  <Button
                    variant="outline"
                    className="justify-start text-destructive hover:text-destructive"
                    onClick={doLogoutAll}
                  >
                    <LogOut className="mr-1 h-4 w-4" /> Logout all sessions
                  </Button>
                ) : null}

                <Button
                  className="mt-2"
                  onClick={() => {
                    openOnboarding();
                    setMobileOpen(false);
                  }}
                >
                  List your business
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

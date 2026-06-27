"use client";

import Link from "next/link";
import { useState } from "react";
import { HardHat, Search, Menu, X, ChevronDown } from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    goBrowse({ search: query.trim(), categorySlug: null });
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
          <Button size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="#list-your-business" onClick={() => goHome()}>
              List your business
            </Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px]">
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
                <Button
                  className="mt-2"
                  onClick={() => {
                    goHome();
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

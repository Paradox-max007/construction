"use client";

import {
  ArrowRight,
  Search,
  MessagesSquare,
  ShieldCheck,
  Star,
  Wallet,
  GitCompare,
  HelpCircle,
  CheckCircle2,
  Building2,
  Users,
  TrendingUp,
  Award,
  Crown,
  Sparkles,
  Phone,
  Mail,
  ChevronDown,
  Lock,
  Globe,
  Calendar,
  CreditCard,
  Home,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMarketplace } from "@/lib/store";
import { formatCompactINR } from "@/lib/format";
import type { PageType } from "@/lib/store";

export function InfoPage({ type }: { type: PageType }) {
  switch (type) {
    case "how-it-works":
      return <HowItWorks />;
    case "pricing-guide":
      return <PricingGuide />;
    case "help-center":
      return <HelpCenter />;
    case "verification":
      return <Verification />;
    case "partner-program":
      return <PartnerProgram />;
    case "pricing-plans":
      return <PricingPlans />;
    case "privacy":
      return <PrivacyPolicy />;
    case "terms":
      return <TermsOfService />;
    default:
      return null;
  }
}

function PageHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <div className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{tag}</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-balance text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

// ---------- How it works ----------
function HowItWorks() {
  const goBrowse = useMarketplace((s) => s.goBrowse);
  const openPage = useMarketplace((s) => s.openPage);
  const steps = [
    { icon: Search, n: "01", title: "Discover & shortlist", desc: "Search by service, location or budget. Browse rich provider profiles with portfolios, reviews and transparent pricing." },
    { icon: GitCompare, n: "02", title: "Compare side by side", desc: "Add up to 3 providers to compare on rating, price, experience, team size and more — with best values highlighted." },
    { icon: MessagesSquare, n: "03", title: "Connect & get quotes", desc: "Request free quotes from your shortlisted pros. Share project details, budget and timeline in one form." },
    { icon: ShieldCheck, n: "04", title: "Hire with confidence", desc: "Pick a verified professional backed by real reviews. Build with trust from foundation to finishing." },
  ];
  return (
    <div>
      <PageHeader tag="How it works" title="From idea to handover in 4 steps" subtitle="BuildCraft makes finding and hiring the right construction professional simple, transparent and stress-free." />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((s) => (
            <Card key={s.n} className="relative overflow-hidden p-6">
              <span className="absolute right-4 top-3 text-5xl font-black text-primary/10">{s.n}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-8 text-center">
          <h2 className="text-xl font-bold">Why thousands choose BuildCraft</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "Verified businesses", d: "GST, licenses & identity checks" },
              { icon: Star, t: "Project-tied reviews", d: "Reviews linked to real completed work" },
              { icon: Wallet, t: "Transparent pricing", d: "See starting prices & packages upfront" },
            ].map((f) => (
              <div key={f.t} className="rounded-xl bg-muted/40 p-4">
                <f.icon className="mx-auto h-7 w-7 text-primary" />
                <p className="mt-2 font-semibold">{f.t}</p>
                <p className="text-xs text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => goBrowse({ categorySlug: null, search: "" })}>
              Start browsing <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => openPage("pricing-guide")}>
              See pricing guide
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Pricing guide (for customers) ----------
function PricingGuide() {
  const goBrowse = useMarketplace((s) => s.goBrowse);
  const ranges = [
    { type: "House Construction", from: "₹1,650", unit: "/sqft", note: "Standard RCC + brick + vitrified flooring", icon: Building2 },
    { type: "Luxury Villa", from: "₹3,200", unit: "/sqft", note: "Italian marble, smart automation, premium finishes", icon: Crown },
    { type: "Interior Design", from: "₹1,450", unit: "/sqft", note: "Modular kitchen, wardrobes, full-home interiors", icon: Sparkles },
    { type: "Home Renovation", from: "₹950", unit: "/sqft", note: "Repaint, refloor, bathroom & kitchen refresh", icon: TrendingUp },
    { type: "Painting", from: "₹18", unit: "/sqft", note: "1-coat putty + 2-coat emulsion, interior", icon: Award },
    { type: "Electrical wiring", from: "₹45", unit: "/sqft", note: "Complete concealed house wiring", icon: Wallet },
  ];
  return (
    <div>
      <PageHeader tag="Pricing guide" title="What does construction cost in India?" subtitle="Ballpark starting prices across popular project types, gathered from verified BuildCraft providers. Final quotes depend on scope, materials and location." />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ranges.map((r) => (
            <Card key={r.type} className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <r.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-semibold">{r.type}</p>
              <p className="mt-1">
                <span className="text-2xl font-extrabold text-primary">{r.from}</span>
                <span className="text-sm text-muted-foreground">{r.unit}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{r.note}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6">
          <h2 className="text-lg font-bold">Factors that affect your final price</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Plot size & built-up area (cost scales per sqft)",
              "Material grade — economy, premium or luxury",
              "Site location & accessibility",
              "Custom features — smart home, home theatre, pool",
              "Structural complexity & number of floors",
              "Timeline — rush jobs may carry a premium",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-6 bg-primary p-6 text-center text-primary-foreground">
          <h2 className="text-lg font-bold">Get a personalized quote</h2>
          <p className="mt-1 text-sm text-primary-foreground/85">Ballpark ranges help — but real quotes come from real providers. Share your project and get up to 3 quotes.</p>
          <Button size="lg" variant="secondary" className="mt-4" onClick={() => goBrowse({ categorySlug: null, search: "" })}>
            Find providers & get quotes <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
}

// ---------- Help center / FAQ ----------
function HelpCenter() {
  const goBrowse = useMarketplace((s) => s.goBrowse);
  const openPage = useMarketplace((s) => s.openPage);
  const faqs = [
    { q: "How do I find the right provider?", a: "Use the search bar or browse by category. Filter by location, rating, verified status and more. Compare up to 3 providers side by side to make an informed choice." },
    { q: "Are providers on BuildCraft verified?", a: "Verified providers carry a green 'Verified' badge. This means their GST, business license and identity have been checked by our team. You can also see listed certificates on each profile." },
    { q: "How do I request a quote?", a: "Open any provider profile and click 'Request free quote' or 'Request quote' on a pricing package. Fill in your project details — the provider is notified and will respond within their stated response time." },
    { q: "Is requesting a quote free?", a: "Yes. Requesting quotes on BuildCraft is completely free for customers. You're never obligated to hire — quotes help you compare and decide." },
    { q: "Can I see real project photos?", a: "Absolutely. Every provider profile has a Portfolio tab with photos, budgets, materials and client reviews for completed projects. Click any photo to view it full-screen." },
    { q: "How are reviews verified?", a: "Reviews marked 'Verified customer' are tied to a completed project through BuildCraft. This keeps reviews authentic and useful." },
    { q: "How does the compare feature work?", a: "Click the compare icon on any provider card (or the Compare button on a profile). Add up to 3 providers, then click 'Compare now' to see a side-by-side table with best values highlighted." },
    { q: "What if I have a dispute with a provider?", a: "BuildCraft is a discovery platform — contracts are between you and the provider. However, we encourage transparent communication via quotes and reviews. For serious issues, reach out to our support team." },
  ];
  return (
    <div>
      <PageHeader tag="Help center" title="Frequently asked questions" subtitle="Everything you need to know about finding, comparing and hiring construction professionals on BuildCraft." />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Card className="mt-8 p-6 text-center">
          <HelpCircle className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 text-lg font-bold">Still have questions?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Our team is here to help you build with confidence.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => goBrowse({ categorySlug: null, search: "" })}>
              <Search className="mr-1 h-4 w-4" /> Browse providers
            </Button>
            <Button variant="outline" onClick={() => openPage("how-it-works")}>
              How it works
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            <Mail className="mr-1 inline h-3 w-3" /> support@buildcraft.in · <Phone className="mx-1 inline h-3 w-3" /> +91 80 4567 8900
          </p>
        </Card>
      </div>
    </div>
  );
}

// ---------- Verification ----------
function Verification() {
  const openPage = useMarketplace((s) => s.openPage);
  const openOnboarding = useMarketplace((s) => s.openOnboarding);
  const checks = [
    { t: "GST registration", d: "Valid GSTIN cross-checked against the government database." },
    { t: "Business license", d: "Trade license / municipal registration verified." },
    { t: "Identity verification", d: "Owner / director KYC with government photo ID." },
    { t: "Insurance & warranties", d: "Labour insurance and structural warranties documented." },
    { t: "Certifications", d: "ISO, CREDAI, COA and trade-body memberships confirmed." },
    { t: "Contact details", d: "Phone, email and office address validated." },
  ];
  return (
    <div>
      <PageHeader tag="Verification" title="The BuildCraft verified badge" subtitle="Trust is everything in construction. Our verification process checks every provider before they earn the green Verified badge." />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {checks.map((c) => (
            <Card key={c.t} className="flex gap-3 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">{c.t}</p>
                <p className="text-sm text-muted-foreground">{c.d}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold">Why verification matters</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            The construction industry has long struggled with fly-by-night operators and quality disputes. By verifying businesses upfront, BuildCraft gives homeowners the confidence to hire — and gives genuine professionals a way to stand out from the crowd.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Users, t: "For customers", d: "Hire from a pool of checked, accountable businesses." },
              { icon: Award, t: "For providers", d: "Stand out with a trusted badge and priority placement." },
              { icon: TrendingUp, t: "For the market", d: "Raise the bar for transparency and quality." },
            ].map((b) => (
              <div key={b.t} className="rounded-xl bg-muted/40 p-4">
                <b.icon className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-semibold">{b.t}</p>
                <p className="text-xs text-muted-foreground">{b.d}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-6 bg-primary p-6 text-center text-primary-foreground">
          <h2 className="text-lg font-bold">Are you a provider? Get verified.</h2>
          <p className="mt-1 text-sm text-primary-foreground/85">List your business and complete verification to earn the trusted badge.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" onClick={openOnboarding}>
              List your business <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => openPage("pricing-plans")}>
              See pricing plans
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Partner program ----------
function PartnerProgram() {
  const openOnboarding = useMarketplace((s) => s.openOnboarding);
  const openPage = useMarketplace((s) => s.openPage);
  const perks = [
    { icon: TrendingUp, t: "Priority placement", d: "Featured in search results and the homepage carousel." },
    { icon: Users, t: "Lead credits", d: "Monthly lead credits included with every paid plan." },
    { icon: Award, t: "Verified badge", d: "Stand out with the trusted green verification badge." },
    { icon: Wallet, t: "Lower commission", d: "Reduced platform commission on booked projects." },
    { icon: Sparkles, t: "Analytics suite", d: "Profile views, lead sources and conversion tracking." },
    { icon: MessagesSquare, t: "Dedicated manager", d: "A partner success manager for Pro & Enterprise tiers." },
  ];
  return (
    <div>
      <PageHeader tag="Partner program" title="Grow your construction business with BuildCraft" subtitle="Join 2,400+ verified professionals using BuildCraft to win more projects, manage leads and build their reputation." />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {perks.map((p) => (
            <Card key={p.t} className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-semibold">{p.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6">
          <h2 className="text-lg font-bold">How the partnership works</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            {[
              { n: "1", t: "List free", d: "Create your business profile at no cost." },
              { n: "2", t: "Get verified", d: "Submit documents and earn the Verified badge." },
              { n: "3", t: "Upgrade plan", d: "Pick a subscription that fits your growth stage." },
              { n: "4", t: "Win projects", d: "Receive leads, quote fast and grow your reviews." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border p-4 text-center">
                <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{s.n}</span>
                <p className="mt-2 text-sm font-semibold">{s.t}</p>
                <p className="text-xs text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-6 bg-primary p-6 text-center text-primary-foreground">
          <h2 className="text-lg font-bold">Become a BuildCraft partner</h2>
          <p className="mt-1 text-sm text-primary-foreground/85">Start free, upgrade when you're ready. No setup fees, cancel anytime.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" onClick={openOnboarding}>
              List your business <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => openPage("pricing-plans")}>
              View pricing plans
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Pricing plans (for providers) ----------
function PricingPlans() {
  const openOnboarding = useMarketplace((s) => s.openOnboarding);
  const plans = [
    {
      name: "Free", price: 0, period: "forever", desc: "Get listed and start receiving leads.",
      features: ["Business profile", "Up to 5 portfolio projects", "Receive leads", "Basic analytics", "Community support"],
      cta: "Start free", highlight: false,
    },
    {
      name: "Basic", price: 1999, period: "/month", desc: "For growing businesses ready to scale.",
      features: ["Everything in Free", "Up to 25 portfolio projects", "20 lead credits / month", "Verified badge eligibility", "Priority search ranking", "Email support"],
      cta: "Choose Basic", highlight: false,
    },
    {
      name: "Professional", price: 4999, period: "/month", desc: "Most popular — for established pros.",
      features: ["Everything in Basic", "Unlimited portfolio", "60 lead credits / month", "Featured placement", "Full analytics suite", "Dedicated manager", "Lead manager CRM"],
      cta: "Choose Professional", highlight: true,
    },
    {
      name: "Enterprise", price: 0, period: "custom", desc: "For large firms & multi-city operators.",
      features: ["Everything in Professional", "Unlimited lead credits", "Multi-user accounts", "API access", "Custom integrations", "Priority support", "Quarterly business review"],
      cta: "Contact sales", highlight: false,
    },
  ];
  return (
    <div>
      <PageHeader tag="Pricing plans" title="Simple pricing for every stage" subtitle="Start free and upgrade as you grow. No setup fees, no hidden charges, cancel anytime." />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <Card key={p.name} className={`relative flex flex-col p-6 ${p.highlight ? "border-primary shadow-lg ring-1 ring-primary/30" : ""}`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-base font-bold">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
              <p className="mt-4">
                {p.price === 0 ? (
                  <span className="text-3xl font-extrabold">{p.period === "custom" ? "Custom" : "₹0"}</span>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold">{formatCompactINR(p.price)}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </>
                )}
              </p>
              <Separator className="my-4" />
              <ul className="flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full" variant={p.highlight ? "default" : "outline"} onClick={openOnboarding}>
                {p.cta}
              </Button>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6">
          <h2 className="text-lg font-bold">All plans include</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              "No setup fees",
              "Cancel anytime",
              "Secure payments",
              "GST invoice provided",
              "99.9% uptime SLA",
              "Data export anytime",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- Privacy Policy ----------
function PrivacyPolicy() {
  return (
    <div>
      <PageHeader tag="Legal" title="Privacy Policy" subtitle="How BuildCraft collects, uses, and protects your data." />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-8">
          <Section title="1. Information We Collect" icon={ShieldCheck}>
            <p>We collect the following types of information:</p>
            <ul className="mt-2 space-y-1.5">
              <li>• <strong>Account information:</strong> Name, email address, phone number, and password (hashed) when you register.</li>
              <li>• <strong>Profile data:</strong> Company details, services, working areas, portfolio, and certificates for providers.</li>
              <li>• <strong>Project data:</strong> Quote requests, messages, reviews, and subscription/payment records.</li>
              <li>• <strong>Usage data:</strong> Pages visited, search queries, and interaction data (via cookies).</li>
              <li>• <strong>Google OAuth data:</strong> If you sign in with Google, we receive your name, email, and profile picture from Google.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information" icon={Sparkles}>
            <ul className="space-y-1.5">
              <li>• To create and manage your account.</li>
              <li>• To match customers with service providers.</li>
              <li>• To process subscription payments and manage featured/premium listings.</li>
              <li>• To send notifications about quotes, leads, and project updates.</li>
              <li>• To verify provider identities and business documents.</li>
              <li>• To improve our services and platform experience.</li>
              <li>• To comply with legal obligations and prevent fraud.</li>
            </ul>
          </Section>

          <Section title="3. Data Sharing" icon={Users}>
            <p>We do <strong>not</strong> sell your data. We share information only in these cases:</p>
            <ul className="mt-2 space-y-1.5">
              <li>• <strong>Provider-Customer matching:</strong> When you request a quote, your name and contact details are shared with the selected provider.</li>
              <li>• <strong>Payment processing:</strong> Transaction details are processed securely (payments are simulated in demo mode).</li>
              <li>• <strong>Legal compliance:</strong> If required by law or court order.</li>
              <li>• <strong>Google:</strong> For Google Sign-In authentication.</li>
            </ul>
          </Section>

          <Section title="4. Data Security" icon={Lock}>
            <ul className="space-y-1.5">
              <li>• Passwords are hashed using scryptSync with salt — never stored in plain text.</li>
              <li>• Session tokens are HMAC-signed and stored in httpOnly cookies.</li>
              <li>• All API communication uses HTTPS in production.</li>
              <li>• Provider documents (licenses, certificates) are accessible only to the provider and admin.</li>
              <li>• Subscription/payment records are immutable and tamper-proof.</li>
            </ul>
          </Section>

          <Section title="5. Your Rights" icon={CheckCircle2}>
            <ul className="space-y-1.5">
              <li>• <strong>Access:</strong> You can view all your data from your dashboard.</li>
              <li>• <strong>Edit:</strong> You can update your profile, contact details, and services anytime.</li>
              <li>• <strong>Delete:</strong> You can request account deletion by contacting support. Admin can also delete accounts.</li>
              <li>• <strong>Opt-out:</strong> You can stop receiving notifications by disabling them in your profile.</li>
            </ul>
          </Section>

          <Section title="6. Cookies" icon={Globe}>
            <p>We use cookies for session management (keeping you logged in). We do not use third-party tracking cookies or advertising cookies.</p>
          </Section>

          <Section title="7. Data Retention" icon={Calendar}>
            <ul className="space-y-1.5">
              <li>• Account data is retained while your account is active.</li>
              <li>• Subscription/payment records are retained permanently for dispute resolution (immutable log).</li>
              <li>• Deleted provider data cascades to projects, reviews, and quotes.</li>
            </ul>
          </Section>

          <Section title="8. Contact" icon={Mail}>
            <p>For privacy-related questions, contact us at <strong>privacy@buildcraft.in</strong>.</p>
          </Section>

          <Card className="bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------- Terms of Service ----------
function TermsOfService() {
  return (
    <div>
      <PageHeader tag="Legal" title="Terms of Service" subtitle="The rules and guidelines for using BuildCraft." />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-8">
          <Section title="1. Acceptance of Terms" icon={CheckCircle2}>
            <p>By creating an account or using BuildCraft, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>
          </Section>

          <Section title="2. User Types" icon={Users}>
            <ul className="space-y-1.5">
              <li>• <strong>Customers:</strong> Homeowners/businesses seeking construction services.</li>
              <li>• <strong>Providers:</strong> Construction professionals offering services. Must be approved by admin before appearing publicly.</li>
              <li>• <strong>Admin:</strong> Platform staff managing the marketplace.</li>
            </ul>
          </Section>

          <Section title="3. Provider Obligations" icon={Building2}>
            <ul className="space-y-1.5">
              <li>• Must provide accurate business information and valid license/certificate documents.</li>
              <li>• Profiles are reviewed by admin before public listing. Misrepresentation may result in rejection or removal.</li>
              <li>• Providers are responsible for the quality and legality of their services.</li>
              <li>• Featured/Premium badges require active subscriptions. Badges are revoked when subscriptions expire.</li>
              <li>• Subscription payments are non-refundable except in cases of platform error (dispute resolution via admin).</li>
            </ul>
          </Section>

          <Section title="4. Customer Obligations" icon={Home}>
            <ul className="space-y-1.5">
              <li>• Must provide accurate contact information (including phone number) when requesting quotes.</li>
              <li>• Reviews must be honest and based on real experiences. Fake reviews will be removed.</li>
              <li>• Customers are responsible for their own contracts with providers — BuildCraft is a discovery platform, not a party to the contract.</li>
            </ul>
          </Section>

          <Section title="5. Subscriptions & Payments" icon={CreditCard}>
            <ul className="space-y-1.5">
              <li>• Providers can subscribe to Weekly, Monthly, or Yearly plans for Featured/Premium/Both boosts.</li>
              <li>• Prices are set by admin and may change. Active subscriptions are not affected by price changes.</li>
              <li>• Each payment generates a unique transaction ID for dispute reference.</li>
              <li>• Subscription records are immutable — they cannot be deleted or modified by anyone (including admin, who can only add dispute notes or cancel).</li>
              <li>• Admin can create promotional offer codes with custom expiry dates and usage limits.</li>
            </ul>
          </Section>

          <Section title="6. Admin Rights" icon={ShieldCheck}>
            <ul className="space-y-1.5">
              <li>• Admin can approve/reject provider listings.</li>
              <li>• Admin can grant/revoke Verified, Premium, and Featured badges at any time.</li>
              <li>• Admin can set custom per-provider pricing.</li>
              <li>• Admin can cancel active subscriptions and revoke privileges.</li>
              <li>• Admin can edit or delete any provider or customer account.</li>
              <li>• Admin can create, activate, deactivate, or delete promotional offers.</li>
            </ul>
          </Section>

          <Section title="7. Prohibited Activities" icon={AlertCircle}>
            <ul className="space-y-1.5">
              <li>• Creating fake accounts or impersonating others.</li>
              <li>• Posting fraudulent or misleading reviews.</li>
              <li>• Uploading fake or stolen documents for verification.</li>
              <li>• Attempting to manipulate search rankings or subscription systems.</li>
              <li>• Sharing accounts or transferring subscriptions.</li>
            </ul>
            <p className="mt-2">Violations may result in account suspension, badge revocation, or permanent ban.</p>
          </Section>

          <Section title="8. Disclaimers" icon={Globe}>
            <ul className="space-y-1.5">
              <li>• BuildCraft is a discovery platform — we do not guarantee the quality of services provided by listed professionals.</li>
              <li>• Contracts are between the customer and provider directly. BuildCraft is not a party to these contracts.</li>
              <li>• We are not liable for any damages, delays, or disputes arising from provider-customer interactions.</li>
            </ul>
          </Section>

          <Section title="9. Changes to Terms" icon={Calendar}>
            <p>We may update these Terms of Service at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </Section>

          <Section title="10. Contact" icon={Mail}>
            <p>For questions about these terms, contact us at <strong>legal@buildcraft.in</strong>.</p>
          </Section>

          <Card className="bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h2>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground [&_strong]:text-foreground [&_ul]:list-none">
        {children}
      </div>
    </Card>
  );
}

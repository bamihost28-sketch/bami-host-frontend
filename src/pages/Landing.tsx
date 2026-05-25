import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import {
  ArrowRight, Building2, BarChart3, Users, ShieldCheck,
  Wallet, TrendingUp, CheckCircle2, Star, ChevronDown,
  MapPin, Zap, PieChart, Rocket,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const heroSlides = [
  {
    image: "/images/hero/hero_business_scaling_1768388722802.png",
    badge: "Scale Systematically",
    title: "One Platform.\nInfinite Possibilities.",
    highlight: "Infinite Possibilities.",
    description:
      "Manage properties, track finances, and grow your business — all from a single professional platform built for serious entrepreneurs.",
    cta: "Get Started Free",
    link: "/register",
  },
  {
    image: "/images/hero/hero_financial_freedom_1768388738721.png",
    badge: "Financial Clarity",
    title: "Take control of your\nPersonal & Business Finances.",
    highlight: "Personal & Business Finances.",
    description:
      "Track assets, budgets, and cash flow with real-time insights and the 50/30/20 framework — designed for how you actually work.",
    cta: "Explore the Platform",
    link: "/product",
  },
  {
    image: "/images/hero/hero_entrepreneur_lifestyle_1768388752631.png",
    badge: "Estate Marketplace",
    title: "Find, List & Manage\nPremier Properties.",
    highlight: "Premier Properties.",
    description:
      "Browse curated residential and commercial spaces, or list your property and connect with quality tenants through our verified marketplace.",
    cta: "View Properties",
    link: "/marketplace/estate",
  },
];

const stats = [
  { value: "500+", label: "Active Users" },
  { value: "₦2.1B+", label: "Assets Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

const offerings = [
  {
    icon: Building2,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    label: "Estate Marketplace",
    desc: "Browse, list, and manage residential and commercial properties with verified listings and smart lead tools.",
    link: "/marketplace/estate",
    cta: "Explore Properties",
  },
  {
    icon: PieChart,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    label: "Portfolio Management",
    desc: "Track personal and business assets, budgets, KPIs, and cash flow in one unified dashboard.",
    link: "/product",
    cta: "See the Platform",
  },
  {
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Entrepreneur Growth",
    desc: "Level up with our 7-Levels framework, hiring planners, leadership modules, and growth benchmarks.",
    link: "/entrepreneur-guide",
    cta: "Start the Guide",
  },
];

const features = [
  { icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", title: "Secure by Design", desc: "Token-based auth with role-based dashboards and granular permissions per team member." },
  { icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", title: "Team & Roles", desc: "Owner, admin, manager, vendor, and customer views — everyone sees exactly what they need." },
  { icon: Wallet, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", title: "Wallet & Cashflow", desc: "50/30/20 budget splits, expenses tracking, and cash-flow insights built into your dashboard." },
  { icon: BarChart3, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", title: "Reports & KPIs", desc: "High-level metrics and detailed reports that matter to you, your team, and your investors." },
  { icon: MapPin, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20", title: "Property Intelligence", desc: "Availability management, lead tracking, and tenant communications in one place." },
  { icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", title: "Fast & Reliable", desc: "Optimistic UI, real-time updates, and a 99.9% uptime SLA — built to work when you do." },
];

const steps = [
  { n: "01", color: "from-blue-500 to-blue-600", glow: "bg-blue-500", title: "Sign up free", desc: "Create your account in under 2 minutes — no credit card required." },
  { n: "02", color: "from-violet-500 to-violet-600", glow: "bg-violet-500", title: "Connect your world", desc: "Add properties, import budgets, invite your team, and configure your roles." },
  { n: "03", color: "from-emerald-500 to-emerald-600", glow: "bg-emerald-500", title: "Grow systematically", desc: "Use dashboards, reports, and our 7-Levels framework to scale with confidence." },
];

const testimonials = [
  { quote: "This put my operations and finances in one clear view. I make faster decisions with less stress.", name: "Amaka O.", title: "Business Owner", stars: 5 },
  { quote: "The 50/30/20 framework and real-time reports finally gave me control of my spending.", name: "Tunde A.", title: "Product Manager", stars: 5 },
  { quote: "Role-based access means my team sees exactly what they need — nothing more, nothing less.", name: "Chidi N.", title: "Operations Lead", stars: 5 },
];

const faqs = [
  { q: "Is there a free plan?", a: "Yes, you can start free. Upgrade anytime for advanced features like multi-property management and detailed reports." },
  { q: "Do you support teams?", a: "Absolutely. Roles include super admin, admin, manager, vendor, and customer — each with a tailored dashboard." },
  { q: "Can I import existing data?", a: "You can import CSVs for budgets, contacts, and assets. More integrations and connectors are on the roadmap." },
  { q: "Is my data secure?", a: "We use token-based auth and follow industry best practices. You control all roles and data access within your workspace." },
  { q: "Can I list my property on the marketplace?", a: "Yes. Once signed in, you can list residential or commercial properties, manage leads, and communicate with tenants directly." },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    heroSlides.forEach((s) => { const img = new Image(); img.src = s.image; });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const goTo = useCallback((idx: number) => setCurrentSlide(idx), []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-[92vh] w-full flex items-center overflow-hidden">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              idx === currentSlide ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20 z-10" />
            <img src={slide.image} alt={slide.badge} className="h-full w-full object-cover" />
          </div>
        ))}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] z-10 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-2xl space-y-7">
            <div
              key={`badge-${currentSlide}`}
              className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-200 font-semibold tracking-wide backdrop-blur-sm animate-in fade-in duration-500"
            >
              <Rocket className="h-3.5 w-3.5 text-blue-300" />
              {heroSlides[currentSlide].badge}
            </div>

            <h1
              key={`title-${currentSlide}`}
              className="text-3xl md:text-5xl font-black leading-tight tracking-tight animate-in fade-in slide-in-from-left-6 duration-700"
            >
              {heroSlides[currentSlide].title.split("\n").map((line, i, arr) =>
                line === heroSlides[currentSlide].highlight ? (
                  <span key={i} className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent block">{line}</span>
                ) : (
                  <span key={i} className="block">{line}</span>
                )
              )}
            </h1>

            <p
              key={`desc-${currentSlide}`}
              className="text-base text-slate-300 leading-relaxed max-w-xl animate-in fade-in duration-700 delay-100"
            >
              {heroSlides[currentSlide].description}
            </p>

            <div key={`cta-${currentSlide}`} className="flex flex-col sm:flex-row gap-3 animate-in fade-in duration-700 delay-200">
              {heroSlides[currentSlide].link.startsWith("http") ? (
                <a href={heroSlides[currentSlide].link} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-5 rounded-xl shadow-lg shadow-blue-900/40">
                    {heroSlides[currentSlide].cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <Link to={heroSlides[currentSlide].link}>
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-5 rounded-xl shadow-lg shadow-blue-900/40">
                    {heroSlides[currentSlide].cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link to="/marketplace/estate">
                <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 px-7 py-5 rounded-xl font-semibold">
                  Explore Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-8 left-6 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={cn("h-1 rounded-full transition-all duration-500", idx === currentSlide ? "w-10 bg-blue-500" : "w-5 bg-white/25 hover:bg-white/50")}
            />
          ))}
        </div>

        <div className="absolute bottom-8 right-1/2 translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/30 select-none">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHAT WE OFFER ── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">What We Offer</span>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-3 mb-3">Everything you need to grow</h2>
            <p className="text-slate-400 max-w-lg mx-auto">One integrated platform covering real estate, financial management, and business growth tools.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {offerings.map((o) => (
              <div key={o.label} className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-300">
                <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center mb-5", o.bg)}>
                  <o.icon className={cn("w-5 h-5", o.color)} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{o.label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-6">{o.desc}</p>
                <Link to={o.link}>
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 bg-transparent hover:bg-slate-700 hover:text-white text-sm font-semibold rounded-xl">
                    {o.cta} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ESTATE PREVIEW ── */}
      <section className="bg-slate-900/40 border-y border-slate-800">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">Estate Marketplace</span>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-2 mb-2">Premium Properties</h2>
                <p className="text-slate-400 max-w-md">Curated residential and commercial spaces verified for quality and accuracy.</p>
              </div>
              <Link to="/marketplace/estate">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-5 rounded-xl shrink-0">
                  View All Properties <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Image bento preview */}
            <div className="grid grid-cols-3 gap-4 h-[280px] rounded-2xl overflow-hidden">
              <div className="col-span-2 relative group overflow-hidden rounded-xl">
                <img
                  src="/images/estate/estate_exterior_modern_1768390624272.png"
                  alt="Modern apartment"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-lg">Apartment</span>
                  <p className="text-white font-bold mt-1 text-sm">Modern Exterior</p>
                  <p className="text-slate-300 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Lagos, Nigeria</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative group overflow-hidden rounded-xl flex-1">
                  <img src="/images/estate/estate_interior_living_1768390639037.png" alt="Living room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <p className="text-white font-bold text-xs">Living Space</p>
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-xl flex-1">
                  <img src="/images/estate/estate_interior_kitchen_modern_1768390652240.png" alt="Kitchen" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <p className="text-white font-bold text-xs">Modern Kitchen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">Platform Features</span>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-3 mb-3">Built for serious professionals</h2>
            <p className="text-slate-400 max-w-md mx-auto">Every feature is designed to save you time and give you clarity.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
                <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center mb-4", f.bg)}>
                  <f.icon className={cn("w-4.5 h-4.5", f.color)} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-slate-900/40 border-y border-slate-800">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">How It Works</span>
              <h2 className="text-2xl md:text-3xl font-black text-white mt-3 mb-3">Up and running in minutes</h2>
              <p className="text-slate-400">No lengthy setup. No complex onboarding. Just sign up and go.</p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+2.5rem)] right-[-50%] h-px bg-gradient-to-r from-slate-700 to-transparent z-0" />
                  )}
                  <div className={cn("relative w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg bg-gradient-to-br mb-5 z-10", step.color)}>
                    {step.n}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 text-center">
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-5 rounded-xl shadow-lg shadow-blue-900/40">
                  Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-slate-500 mt-3">No credit card required · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">Testimonials</span>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-3 mb-3">Trusted by entrepreneurs</h2>
            <p className="text-slate-400">Hear from people already scaling with BamiHustle.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic flex-1 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-800 pt-10">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-slate-900/40 border-y border-slate-800">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">FAQ</span>
              <h2 className="text-2xl md:text-3xl font-black text-white mt-3 mb-3">Common Questions</h2>
              <p className="text-slate-400">Everything you need to know before getting started.</p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border border-slate-800 rounded-xl bg-slate-900 px-5 overflow-hidden data-[state=open]:border-blue-500/40"
                >
                  <AccordionTrigger className="text-white font-semibold text-sm py-4 hover:no-underline [&[data-state=open]]:text-blue-400">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400 text-sm pb-4 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-br from-blue-950/60 via-slate-900 to-violet-950/40 p-10 md:p-16 text-center">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/15 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                <Rocket className="h-3.5 w-3.5" /> Ready to start?
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                Build your business the{" "}
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">right way</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto mb-10 leading-relaxed">
                Join hundreds of entrepreneurs who manage their properties, track their finances, and scale their businesses on BamiHustle — all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-5 rounded-xl shadow-lg shadow-blue-900/40">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/marketplace/estate">
                  <Button variant="outline" className="border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800 hover:text-white px-8 py-5 rounded-xl font-semibold">
                    Browse Properties
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {["No credit card required", "30-day money-back guarantee", "Cancel anytime"].map((b) => (
                  <span key={b} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;

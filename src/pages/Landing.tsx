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

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    badge: "Scale Systematically",
    title: "One Platform.\nInfinite Possibilities.",
    highlight: "Infinite Possibilities.",
    description:
      "Manage properties, track finances, and grow your business — all from a single professional platform built for serious entrepreneurs.",
    cta: "Get Started Free",
    link: "/register",
  },
  {
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
    badge: "Financial Clarity",
    title: "Take control of your\nPersonal & Business Finances.",
    highlight: "Personal & Business Finances.",
    description:
      "Track assets, budgets, and cash flow with real-time insights and the 50/30/20 framework — designed for how you actually work.",
    cta: "Explore the Platform",
    link: "/product",
  },
  {
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
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
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/20",
    label: "Estate Marketplace",
    desc: "Browse, list, and manage residential and commercial properties with verified listings and smart lead tools.",
    link: "/marketplace/estate",
    cta: "Explore Properties",
  },
  {
    icon: PieChart,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Portfolio Management",
    desc: "Track personal and business assets, budgets, KPIs, and cash flow in one unified dashboard.",
    link: "/product",
    cta: "See the Platform",
  },
  {
    icon: TrendingUp,
    color: "text-teal-500",
    bg: "bg-teal-500/10 border-teal-500/20",
    label: "Entrepreneur Growth",
    desc: "Level up with our 7-Levels framework, hiring planners, leadership modules, and growth benchmarks.",
    link: "/entrepreneur-guide",
    cta: "Start the Guide",
  },
];

const features = [
  { icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20", title: "Secure by Design", desc: "Token-based auth with role-based dashboards and granular permissions per team member." },
  { icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", title: "Team & Roles", desc: "Owner, admin, manager, vendor, and customer views — everyone sees exactly what they need." },
  { icon: Wallet, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", title: "Wallet & Cashflow", desc: "50/30/20 budget splits, expenses tracking, and cash-flow insights built into your dashboard." },
  { icon: BarChart3, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20", title: "Reports & KPIs", desc: "High-level metrics and detailed reports that matter to you, your team, and your investors." },
  { icon: MapPin, color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/20", title: "Property Intelligence", desc: "Availability management, lead tracking, and tenant communications in one place." },
  { icon: Zap, color: "text-lime-500", bg: "bg-lime-500/10 border-lime-500/20", title: "Fast & Reliable", desc: "Optimistic UI, real-time updates, and a 99.9% uptime SLA — built to work when you do." },
];

const steps = [
  { n: "01", color: "from-green-500 to-green-600", glow: "bg-green-500", title: "Sign up free", desc: "Create your account in under 2 minutes — no credit card required." },
  { n: "02", color: "from-emerald-500 to-emerald-600", glow: "bg-emerald-500", title: "Connect your world", desc: "Add properties, import budgets, invite your team, and configure your roles." },
  { n: "03", color: "from-teal-500 to-teal-600", glow: "bg-teal-500", title: "Grow systematically", desc: "Use dashboards, reports, and our 7-Levels framework to scale with confidence." },
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
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden grain">
      <Navbar />

      {/* ── HERO ── Asymmetric left-aligned layout */}
      <section className="relative min-h-[100dvh] w-full flex items-center overflow-hidden">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              idx === currentSlide ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30 z-10" />
            <img src={slide.image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
          </div>
        ))}

        {/* Ambient glow */}
        <div className="absolute left-0 top-1/3 w-[600px] h-[600px] bg-green-600/8 rounded-full blur-[120px] z-10 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-2xl space-y-8">
            {/* Badge */}
            <div
              key={`badge-${currentSlide}`}
              className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-4 py-1.5 text-xs text-green-200 font-semibold tracking-wide liquid-glass stagger-item"
            >
              <Rocket className="h-3.5 w-3.5 text-green-300" />
              {heroSlides[currentSlide].badge}
            </div>

            {/* Headline - asymmetric, left-aligned */}
            <h1
              key={`title-${currentSlide}`}
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tighter stagger-item"
            >
              {heroSlides[currentSlide].title.split("\n").map((line, i) =>
                line === heroSlides[currentSlide].highlight ? (
                  <span key={i} className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent block">{line}</span>
                ) : (
                  <span key={i} className="block text-white/90">{line}</span>
                )
              )}
            </h1>

            {/* Description */}
            <p
              key={`desc-${currentSlide}`}
              className="text-base md:text-lg text-slate-300/90 leading-relaxed max-w-xl stagger-item"
            >
              {heroSlides[currentSlide].description}
            </p>

            {/* CTAs */}
            <div key={`cta-${currentSlide}`} className="flex flex-col sm:flex-row gap-3 stagger-item">
              <Link to={heroSlides[currentSlide].link}>
                <Button className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-green-900/40 btn-interactive text-sm">
                  {heroSlides[currentSlide].cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/marketplace/estate">
                <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 px-8 py-6 rounded-xl font-semibold btn-interactive liquid-glass text-sm">
                  Explore Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-10 left-6 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                idx === currentSlide ? "w-12 bg-green-500" : "w-6 bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="absolute bottom-10 right-1/2 translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/30 select-none">
          <span className="text-[10px] tracking-widest uppercase font-medium">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-white/10 bg-white/5 liquid-glass">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <div key={s.label} className="text-center stagger-item">
                <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{s.value}</p>
                <p className="text-xs text-green-400/80 uppercase tracking-widest mt-1 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHAT WE OFFER ── Asymmetric 2-col + 1 layout */}
      <section className="container mx-auto px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs font-bold tracking-widest text-green-400 uppercase">What We Offer</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-3 tracking-tight leading-tight">
              Everything you need<br />to grow
            </h2>
            <p className="text-slate-400 max-w-lg mt-4 text-base leading-relaxed">One integrated platform covering real estate, financial management, and business growth tools.</p>
          </div>

          {/* Asymmetric grid: 2 large + 1 tall */}
          <div className="grid md:grid-cols-2 gap-5">
            {offerings.map((o, idx) => (
              <div
                key={o.label}
                className={cn(
                  "group flex flex-col bg-slate-900 border border-white/5 rounded-2xl p-8 hover:border-green-500/30 hover:bg-slate-800/60 transition-all duration-500 stagger-item",
                  idx === 2 && "md:col-span-2 md:flex-row md:items-center md:gap-8"
                )}
              >
                <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 shrink-0", o.bg)}>
                  <o.icon className={cn("w-6 h-6", o.color)} />
                </div>
                <div className={cn("flex-1", idx === 2 && "md:mb-0")}>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{o.label}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{o.desc}</p>
                  <Link to={o.link}>
                    <Button variant="outline" className="border-white/10 text-slate-300 bg-transparent hover:bg-green-600 hover:text-white hover:border-green-600 text-sm font-semibold rounded-xl btn-interactive">
                      {o.cta} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ESTATE PREVIEW ── Asymmetric bento grid */}
      <section className="bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6 py-28">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-bold tracking-widest text-green-400 uppercase">Estate Marketplace</span>
                <h2 className="text-3xl md:text-5xl font-black text-white mt-2 tracking-tight leading-tight">Premium Properties</h2>
                <p className="text-slate-400 max-w-md mt-3">Curated residential and commercial spaces verified for quality and accuracy.</p>
              </div>
              <Link to="/marketplace/estate">
                <Button className="bg-green-600 hover:bg-green-500 text-white font-bold px-7 py-5 rounded-xl shrink-0 btn-interactive">
                  View All Properties <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Bento grid - asymmetric layout */}
            <div className="grid grid-cols-3 gap-4 h-[320px] rounded-2xl overflow-hidden">
              <div className="col-span-2 relative group overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern apartment exterior"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <span className="text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg">Apartment</span>
                  <p className="text-white font-bold mt-2 text-base tracking-tight">Modern Exterior</p>
                  <p className="text-slate-300 text-xs flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> Lagos, Nigeria</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative group overflow-hidden rounded-xl flex-1">
                  <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80" alt="Living room interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-bold text-sm tracking-tight">Living Space</p>
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-xl flex-1">
                  <img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80" alt="Modern kitchen" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-bold text-sm tracking-tight">Modern Kitchen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ── Asymmetric 2+2+2 grid */}
      <section className="container mx-auto px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs font-bold tracking-widest text-green-400 uppercase">Platform Features</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-3 tracking-tight leading-tight">
              Built for serious<br />professionals
            </h2>
            <p className="text-slate-400 max-w-md mt-4">Every feature is designed to save you time and give you clarity.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className={cn(
                  "group bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-green-500/30 hover:bg-slate-800/60 transition-all duration-500 stagger-item",
                  idx === 0 && "lg:col-span-2 lg:flex-row lg:items-center lg:gap-6"
                )}
              >
                <div className={cn("w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 shrink-0", f.bg)}>
                  <f.icon className={cn("w-5 h-5", f.color)} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6 py-28">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold tracking-widest text-green-400 uppercase">How It Works</span>
              <h2 className="text-3xl md:text-5xl font-black text-white mt-3 tracking-tight leading-tight">Up and running in minutes</h2>
              <p className="text-slate-400 mt-4">No lengthy setup. No complex onboarding. Just sign up and go.</p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center relative stagger-item">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+2.5rem)] right-[-50%] h-px bg-gradient-to-r from-green-500/40 to-transparent z-0" />
                  )}
                  <div className={cn("relative w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg bg-gradient-to-br mb-5 z-10 btn-interactive", step.color)}>
                    {step.n}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-500 text-white font-bold px-10 py-6 rounded-xl shadow-lg shadow-green-900/40 btn-interactive">
                  Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-slate-500 mt-3">No credit card required &middot; Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── Asymmetric layout */}
      <section className="container mx-auto px-6 py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs font-bold tracking-widest text-green-400 uppercase">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-3 tracking-tight leading-tight">
              Trusted by entrepreneurs
            </h2>
            <p className="text-slate-400 mt-4">Hear from people already scaling with BamiHost.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-900 border border-white/5 rounded-2xl p-7 flex flex-col hover:border-green-500/20 transition-all duration-500 stagger-item">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-green-400 text-green-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic flex-1 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center stagger-item">
                <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{s.value}</p>
                <p className="text-xs text-green-400/80 uppercase tracking-widest mt-1 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6 py-28">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold tracking-widest text-green-400 uppercase">FAQ</span>
              <h2 className="text-3xl md:text-5xl font-black text-white mt-3 tracking-tight leading-tight">Common Questions</h2>
              <p className="text-slate-400 mt-4">Everything you need to know before getting started.</p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border border-white/5 rounded-xl bg-slate-900/80 px-5 overflow-hidden data-[state=open]:border-green-500/40"
                >
                  <AccordionTrigger className="text-white font-semibold text-sm py-4 hover:no-underline [&[data-state=open]]:text-green-400 tracking-tight">
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
      <section className="container mx-auto px-6 py-28">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-green-950/40 via-slate-900 to-emerald-950/30 p-10 md:p-16 text-center liquid-glass">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-green-500/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 liquid-glass">
                <Rocket className="h-3.5 w-3.5" /> Ready to start?
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
                Build your business the{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">right way</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto mb-10 leading-relaxed">
                Join hundreds of entrepreneurs who manage their properties, track their finances, and scale their businesses on BamiHost — all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Link to="/register">
                  <Button className="bg-green-600 hover:bg-green-500 text-white font-bold px-10 py-6 rounded-xl shadow-lg shadow-green-900/40 btn-interactive">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/marketplace/estate">
                  <Button variant="outline" className="border-white/10 text-slate-300 bg-transparent hover:bg-white/5 px-10 py-6 rounded-xl font-semibold btn-interactive liquid-glass">
                    Browse Properties
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {["No credit card required", "30-day money-back guarantee", "Cancel anytime"].map((b) => (
                  <span key={b} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
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

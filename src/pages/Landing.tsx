import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  PieChart,
  Users,
  ArrowRight,
  Rocket,
  Gauge,
  Wallet,
  BarChart3,
  Star,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: <PieChart className="w-5 h-5" />,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/15 border-violet-500/20",
    title: "Personal & Business Portfolios",
    desc: "Track assets, budgets, and performance across life and business.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15 border-emerald-500/20",
    title: "Secure by Design",
    desc: "Auth-protected dashboards with granular permissions.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15 border-blue-500/20",
    title: "Team & Roles",
    desc: "Role-based views for owners, admins, managers, vendors and customers.",
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15 border-amber-500/20",
    title: "Wallet & Cashflow",
    desc: "50/30/20 splits, budgets, expenses and insights.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/15 border-rose-500/20",
    title: "Reports & KPIs",
    desc: "High-level metrics that matter to you and your team.",
  },
  {
    icon: <Gauge className="w-5 h-5" />,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15 border-cyan-500/20",
    title: "Performance",
    desc: "Fast, responsive UI with delightful interactions.",
  },
];

const lifecycle = [
  { num: "1", color: "blue", label: "Eureka Moment", quote: '"This is going to be easy!"', desc: "The idea hits—pure excitement and uninformed optimism." },
  { num: "2", color: "purple", label: "Launch Drudgery", quote: '"We\'re all doomed."', desc: "Reality hits. Feels hopeless, but you push through anyway." },
  { num: "3", color: "green", label: "Initial Traction", quote: '"We might have something!"', desc: "You make your first buck. 80% reach here—celebrate!" },
  { num: "4", color: "yellow", label: "Early Growth", quote: '"Finally got it—where\'s the champagne?"', desc: "Fun phase. Momentum builds, riches seem imminent." },
  { num: "5", color: "red", label: "The Flatline", quote: '"Why isn\'t this working anymore?"', desc: "Peak confidence crashes into stagnation. Growth vanishes." },
  { num: "6", color: "emerald", label: "Breakthrough", quote: '"Informed realism."', desc: "Learn to scale systematically. Put money in your family's account." },
];

const lifecycleColorMap: Record<string, string> = {
  blue: "bg-blue-500/10 border-blue-400/20 text-blue-400",
  purple: "bg-purple-500/10 border-purple-400/20 text-purple-400",
  green: "bg-green-500/10 border-green-400/20 text-green-400",
  yellow: "bg-yellow-500/10 border-yellow-400/20 text-yellow-400",
  red: "bg-red-500/10 border-red-400/20 text-red-400",
  emerald: "bg-emerald-500/10 border-emerald-400/20 text-emerald-400",
};

const testimonials = [
  {
    quote: "This put my operations and finances in one clear view. I make decisions faster now.",
    name: "Amaka O.",
    title: "Business Owner",
    stars: 5,
  },
  {
    quote: "The 50/30/20 split and reports helped me get control of spending.",
    name: "Tunde A.",
    title: "Product Manager",
    stars: 5,
  },
  {
    quote: "Role-based access means my team sees exactly what they need—nothing more.",
    name: "Chidi N.",
    title: "Operations Lead",
    stars: 5,
  },
];

const faqs = [
  { q: "Is there a free plan?", a: "Yes, you can start free. You can upgrade anytime for advanced features." },
  { q: "Do you support teams?", a: "Yes, roles include super admin, admin, manager, vendor and customer with tailored dashboards." },
  { q: "Can I import existing data?", a: "You can import CSVs for budgets, contacts and assets. More connectors are coming." },
  { q: "Is my data secure?", a: "We use token-based auth and follow best practices. You control roles and access." },
];

const ctoBenefits = [
  "No credit card required to start",
  "30-day money-back guarantee",
  "Invite your team from day one",
  "Cancel anytime, no lock-in",
];

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = useMemo(() => [
    {
      image: "/images/hero/hero_business_scaling_1768388722802.png",
      badge: "Scale Systematically",
      title: "While starting a business is hard, SCALING is even harder.",
      description:
        "Break free from the entrepreneurial flatline. Our systematic approach helps you scale yourself so you can scale your company.",
      cta: "Build My Level 7 Plan",
      link: "https://docs.google.com/forms/d/e/1FAIpQLSf2n02tzF1Yti8ZiwVDhOjnvPpgCKayNZsuxr4vpRF8DY4TLA/viewform?usp=dialog",
    },
    {
      image: "/images/hero/hero_financial_freedom_1768388738721.png",
      badge: "Financial Clarity",
      title: "Take back control of your Personal & Business finances.",
      description:
        "Track assets, budgets, and performance across life and business with 50/30/20 splits and real-time insights.",
      cta: "Get Started Free",
      link: "/register",
    },
    {
      image: "/images/hero/hero_entrepreneur_lifestyle_1768388752631.png",
      badge: "Master Your Time",
      title: "Stronger founders create better teams and healthier families.",
      description:
        "Our role-based dashboards and reports mean you stay at the helm—without burning out or losing control.",
      cta: "Join 500+ Entrepreneurs",
      link: "/login",
    },
  ], []);

  useEffect(() => {
    heroSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, [heroSlides]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleManualSlideChange = useCallback((idx: number) => {
    setCurrentSlide(idx);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative h-[90vh] md:h-screen w-full flex items-center overflow-hidden">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              idx === currentSlide ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/20 z-10" />
            <img
              src={slide.image}
              alt={slide.badge}
              className="h-full w-full object-cover scale-105 animate-[ken-burns_20s_ease-in-out_infinite]"
            />
          </div>
        ))}

        {/* Radial glow under content */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] z-10 pointer-events-none" />

        {/* Content */}
        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl space-y-8">
            <div
              key={`badge-${currentSlide}`}
              className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200 backdrop-blur-sm animate-in fade-in slide-in-from-left-4 duration-700"
            >
              <Rocket className="h-4 w-4 text-blue-300" />
              <span>{heroSlides[currentSlide].badge}</span>
            </div>

            <div key={`content-${currentSlide}`} className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                {heroSlides[currentSlide].title.split("SCALING").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent italic">
                        SCALING
                      </span>
                    )}
                  </span>
                ))}
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-left-12 duration-700 delay-200">
                {heroSlides[currentSlide].description}
              </p>
            </div>

            <div
              key={`cta-${currentSlide}`}
              className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-300"
            >
              {heroSlides[currentSlide].link.startsWith("http") ? (
                <a
                  href={heroSlides[currentSlide].link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-7 text-lg shadow-xl shadow-blue-900/50 transition-all duration-300 hover:scale-105"
                  >
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              ) : (
                <Link to={heroSlides[currentSlide].link}>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-7 text-lg shadow-xl shadow-blue-900/50 transition-all duration-300 hover:scale-105"
                  >
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm px-8 py-7 text-lg transition-all duration-300"
                >
                  Start for free
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-10 left-6 z-20 flex gap-3">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleManualSlideChange(idx)}
              className={cn(
                "h-1.5 transition-all duration-500 rounded-full",
                idx === currentSlide
                  ? "w-12 bg-blue-500"
                  : "w-6 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 right-1/2 translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/30 select-none">
          <span className="text-[11px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* ─── Estate Renting ─── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-bold text-sm px-4 py-2 rounded-full">
              <Zap className="w-3.5 h-3.5" />
              Estate Renting
            </div>
            <h2 className="text-xl md:text-2xl font-bold leading-snug">
              Find, manage, and rent estates{" "}
              <span className="text-fuchsia-400">seamlessly</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Showcase your properties with beautiful galleries, manage
              availability and leads, and streamline tenant communications—all
              in one place.
            </p>
            <ul className="space-y-2">
              {["Beautiful property galleries", "Availability & lead management", "Tenant communication tools"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/dashboard/estate">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white"
                >
                  Go to Estate Dashboard
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/5 text-white hover:bg-white/10 border-white/20"
                >
                  Sign in to list a property
                </Button>
              </Link>
            </div>
          </div>

          {/* Bento image grid */}
          <div className="grid grid-cols-2 gap-3 h-[400px]">
            <img
              src="/images/estate/estate_exterior_modern_1768390624272.png"
              alt="Modern apartment exterior"
              className="rounded-2xl w-full h-full object-cover border border-white/10 row-span-2 hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
            <div className="grid grid-rows-2 gap-3">
              <img
                src="/images/estate/estate_interior_living_1768390639037.png"
                alt="Cozy living room"
                className="rounded-2xl w-full h-full object-cover border border-white/10 hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
              <img
                src="/images/estate/estate_interior_kitchen_modern_1768390652240.png"
                alt="Kitchen interior"
                className="rounded-2xl w-full h-full object-cover border border-white/10 hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Business Failure Stats ─── */}
      <section className="bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
                The Data
              </span>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-300 via-blue-200 to-blue-300 bg-clip-text text-transparent mb-4">
                The Truth About Business Failure
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Here's what the data shows about{" "}
                <span className="font-bold text-red-400">scaling vs. starting</span>
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {[
                {
                  label: "First Year Survival",
                  value: "80%",
                  sub: "Most clear the launch hurdle",
                  note: "✓ If you're here, celebrate!",
                  border: "border-green-500/30",
                  bg: "from-green-950/40 to-green-900/20",
                  glow: "from-green-500/10",
                  textGrad: "from-green-400 to-green-600",
                  noteColor: "text-green-300",
                  subColor: "text-green-200/80",
                  labelColor: "text-green-200",
                },
                {
                  label: "5-Year Mark",
                  value: "50%",
                  sub: "The drop happens during scaling",
                  note: "⚠ The real challenge begins",
                  border: "border-yellow-500/30",
                  bg: "from-yellow-950/40 to-yellow-900/20",
                  glow: "from-yellow-500/10",
                  textGrad: "from-yellow-400 to-yellow-600",
                  noteColor: "text-yellow-300",
                  subColor: "text-yellow-200/80",
                  labelColor: "text-yellow-200",
                },
                {
                  label: "Eventually Fail",
                  value: "91%",
                  sub: "Long-term survival is rare",
                  note: "💔 The scaling wall",
                  border: "border-red-500/30",
                  bg: "from-red-950/40 to-red-900/20",
                  glow: "from-red-500/10",
                  textGrad: "from-red-400 to-red-600",
                  noteColor: "text-red-300",
                  subColor: "text-red-200/80",
                  labelColor: "text-red-200",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-8 backdrop-blur-sm shadow-2xl bg-gradient-to-br",
                    stat.border,
                    stat.bg
                  )}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent", stat.glow)} />
                  <div className="relative text-center space-y-3">
                    <p className={cn("text-xs font-bold uppercase tracking-widest", stat.labelColor)}>
                      {stat.label}
                    </p>
                    <div className={cn("text-3xl md:text-4xl font-black bg-gradient-to-br bg-clip-text text-transparent", stat.textGrad)}>
                      {stat.value}
                    </div>
                    <p className={cn("text-sm", stat.subColor)}>{stat.sub}</p>
                    <p className={cn("text-xs font-medium", stat.noteColor)}>{stat.note}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Journey progress bar */}
            <div className="flex items-center gap-2 mb-14 px-2">
              <div className="flex-1 h-1.5 rounded-full bg-green-500/70" />
              <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div className="flex-1 h-1.5 rounded-full bg-yellow-500/70" />
              <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div className="flex-1 h-1.5 rounded-full bg-red-500/70" />
            </div>

            {/* Entrepreneurial Lifecycle */}
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-8">
              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">The Entrepreneurial Lifecycle</h3>
                <p className="text-slate-400">Every founder experiences this emotional rollercoaster</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {lifecycle.map((item) => {
                  const colorClass = lifecycleColorMap[item.color];
                  const [bgClass, borderClass, textClass] = colorClass.split(" ");
                  return (
                    <div
                      key={item.num}
                      className={cn(
                        "rounded-xl p-5 border transition-all duration-200 hover:scale-[1.02]",
                        bgClass,
                        borderClass
                      )}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border", bgClass, borderClass, textClass)}>
                          {item.num}
                        </div>
                        <div className={cn("font-bold text-sm", textClass)}>{item.label}</div>
                      </div>
                      <p className="text-xs text-slate-400 italic mb-1">{item.quote}</p>
                      <p className="text-xs text-slate-300">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-red-500/10 via-slate-900/50 to-emerald-500/10 rounded-xl p-6 border border-emerald-400/20 text-center">
                <p className="text-base font-semibold text-white mb-1">
                  <span className="text-red-400">The Secret:</span> Most get stuck in the flatline because they don't know how to{" "}
                  <span className="text-emerald-400 font-bold">scale systematically</span>.
                </p>
                <p className="text-slate-400 text-sm">If you're flatlined, you're not broken—you just need the right roadmap.</p>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-600/20 border border-emerald-400/30 rounded-full px-6 py-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-semibold text-sm">Join the 9% that break through the flatline</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Our Mission / Features ─── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold text-xs px-4 py-2 rounded-full tracking-widest uppercase mb-6">
              Our Mission
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 leading-tight">
              Help entrepreneurs{" "}
              <span className="text-green-400">scale themselves</span>
            </h2>
            <h3 className="text-xl md:text-2xl font-bold mb-8 leading-tight">
              so they can{" "}
              <span className="text-green-400">scale their companies</span>
            </h3>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Because stronger founders create better teams, healthier families, and thriving economies.
              You should stay at the helm as long as you want—without burning out or losing control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.07] hover:border-white/20 hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative space-y-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110",
                      feature.iconColor,
                      feature.iconBg
                    )}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1.5">{feature.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
                The Process
              </span>
              <h2 className="text-xl md:text-2xl font-bold mb-4">Your Path to Level 7</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Follow our proven 3-step system to build a systematic approach that scales. No more guesswork.
              </p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  n: "1",
                  numBg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30",
                  glow: "bg-blue-500",
                  title: "Define Your Number",
                  desc: "Set your revenue, profit, and valuation targets with clear milestones",
                },
                {
                  n: "2",
                  numBg: "bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/30",
                  glow: "bg-green-500",
                  title: "Walk the 7 Levels",
                  desc: "Follow our proven roadmap with systematic growth strategies at each level",
                },
                {
                  n: "3",
                  numBg: "bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30",
                  glow: "bg-purple-500",
                  title: "Execute & Scale",
                  desc: "Track progress, optimize performance, and scale systematically",
                },
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[-50%] h-px bg-gradient-to-r from-white/20 to-white/5 z-0" />
                  )}
                  <div className={cn(
                    "relative w-16 h-16 mb-6 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg z-10",
                    step.numBg
                  )}>
                    {step.n}
                    <div className={cn("absolute inset-0 rounded-2xl blur-xl opacity-40", step.glow)} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Results showcase */}
            <div className="bg-white/[0.03] rounded-3xl border border-white/10 p-8 md:p-12 mb-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">What Breakthrough Looks Like</h3>
                <p className="text-slate-400 text-sm">Real outcomes from founders who learned to scale systematically</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {[
                  { value: "2×", label: "Revenue Growth", sub: "Without working more hours", color: "text-green-400" },
                  { value: "2×", label: "Take-Home Profit", sub: "Money in your family's account", color: "text-blue-400" },
                  { value: "L7", label: "Business Maturity", sub: 'Your "number" + exit readiness', color: "text-purple-400" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center pt-6 md:pt-0 first:pt-0">
                    <div className={cn("text-2xl md:text-3xl font-black mb-2", stat.color)}>{stat.value}</div>
                    <div className="text-sm font-semibold text-white mb-1">{stat.label}</div>
                    <div className="text-xs text-slate-400">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/product">
                <Button size="lg" variant="outline" className="bg-white/5 text-slate-100 hover:bg-white/10 border-white/15">
                  Learn More About Our Platform
                </Button>
              </Link>
              <Link to="/entrepreneur-guide">
                <Button size="lg" variant="outline" className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10">
                  Discover Your Entrepreneur Type
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
              Social Proof
            </span>
            <h2 className="text-xl md:text-2xl font-bold mb-3">What Entrepreneurs Are Saying</h2>
            <p className="text-lg text-slate-400">Join hundreds of entrepreneurs who've transformed their business approach</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {/* Quote mark */}
                <svg className="w-8 h-8 text-blue-500/40 mb-2 flex-shrink-0" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-slate-200 text-sm leading-relaxed mb-6 flex-1 italic">{t.quote}</p>
                <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-white/10">
            {[
              { value: "500+", label: "Active Users" },
              { value: "₦2.1B+", label: "Assets Tracked" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Entrepreneur Types ─── */}
      <section className="bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
              Self Discovery
            </span>
            <h2 className="text-xl md:text-2xl font-bold mb-4">What Type of Entrepreneur Are You?</h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Discover your entrepreneurial journey and get a personalized roadmap to scale systematically.
            </p>
            <Link to="/entrepreneur-guide">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-900/50 transition-all duration-300 hover:scale-105 px-8"
              >
                Take the Entrepreneur Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
              FAQ
            </span>
            <h2 className="text-xl md:text-2xl font-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-400">Everything you need to know about getting started</p>
          </div>

          <Accordion type="single" className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border border-white/10 rounded-xl bg-white/[0.03] px-6 overflow-hidden data-[state=open]:border-blue-500/30 data-[state=open]:bg-blue-500/[0.04] transition-all duration-200"
              >
                <AccordionTrigger className="text-white font-semibold text-base py-5 hover:no-underline [&[data-state=open]]:text-blue-300">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="container mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 max-w-5xl mx-auto">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=60"
              alt=""
              className="h-full w-full object-cover opacity-10"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700/40 via-purple-700/30 to-slate-900" />
          </div>

          {/* Glows */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative px-6 py-16 md:px-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200 backdrop-blur-sm mb-6">
              <Rocket className="h-4 w-4 text-blue-300" />
              Ready to scale?
            </div>
            <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
              Ready to Break Through{" "}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                the Flatline?
              </span>
            </h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              If you're stuck, burned out, or wondering "what's next?"—you're not broken.
              You just need the right roadmap. Scale yourself to scale your company.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSf2n02tzF1Yti8ZiwVDhOjnvPpgCKayNZsuxr4vpRF8DY4TLA/viewform?usp=dialog"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold px-8 py-6 text-lg shadow-xl shadow-green-900/50 transition-all duration-300 hover:scale-105"
                >
                  Build My Level 7 Plan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white hover:bg-white/20 border-white/25 backdrop-blur-sm font-semibold px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
                >
                  I already have an account
                </Button>
              </Link>
            </div>

            {/* Benefits list */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {ctoBenefits.map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-sm text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;

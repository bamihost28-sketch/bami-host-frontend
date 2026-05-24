import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Building2,
  ShieldCheck,
  PieChart,
  Users,
  ArrowRight,
  Rocket,
  Gauge,
  Wallet,
  BarChart3,
  CheckCircle2,
  Quote,
  ArrowLeft,
} from "lucide-react";

const features = [
  { icon: <PieChart className="w-5 h-5" />, title: "Personal & Business Portfolios", desc: "Track assets, budgets, and performance across life and business." },
  { icon: <ShieldCheck className="w-5 h-5" />, title: "Secure by Design", desc: "Auth-protected dashboards with granular permissions." },
  { icon: <Users className="w-5 h-5" />, title: "Team & Roles", desc: "Role-based views for owners, admins, managers, vendors and customers." },
  { icon: <Wallet className="w-5 h-5" />, title: "Wallet & Cashflow", desc: "50/30/20 splits, budgets, expenses and insights." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Reports & KPIs", desc: "High-level metrics that matter to you and your team." },
  { icon: <Gauge className="w-5 h-5" />, title: "Performance", desc: "Fast, responsive UI with delightful interactions." },
];

const steps = [
  { step: 1, title: "Create your account", desc: "Sign up and set your basic preferences." },
  { step: 2, title: "Add your portfolios", desc: "Connect business units, assets, budgets and goals." },
  { step: 3, title: "Track & grow", desc: "View dashboards, collaborate with roles, and optimize." },
];

const testimonials = [
  {
    quote: "This put my operations and finances in one clear view. I make decisions faster now.",
    name: "Amaka O.",
    title: "Business Owner",
  },
  {
    quote: "The 50/30/20 split and reports helped me get control of spending.",
    name: "Tunde A.",
    title: "Product Manager",
  },
  {
    quote: "Role-based access means my team sees exactly what they need—nothing more.",
    name: "Chidi N.",
    title: "Operations Lead",
  },
];

const faqs = [
  { q: "Is there a free plan?", a: "Yes, you can start free. You can upgrade anytime for advanced features." },
  { q: "Do you support teams?", a: "Yes, roles include super admin, admin, manager, vendor and customer with tailored dashboards." },
  { q: "Can I import existing data?", a: "You can import CSVs for budgets, contacts and assets. More connectors are coming." },
  { q: "Is my data secure?", a: "We use token-based auth and follow best practices. You control roles and access." },
];

const productShots = [
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1551281044-8c3f1e82b6df?auto=format&fit=crop&w=1600&q=80",
];

const Product = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Decorative animated blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-48 w-48 md:h-72 md:w-72 rounded-full bg-blue-600/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 md:h-72 md:w-72 rounded-full bg-purple-600/30 blur-3xl animate-pulse [animation-delay:300ms]" />
        <div className="absolute top-1/3 -right-16 h-24 w-24 md:h-40 md:w-40 rounded-full bg-emerald-500/20 blur-2xl animate-[spin_18s_linear_infinite]" />
      </div>

      <Navbar />

      {/* Back to Home */}
      <section className="container mx-auto px-6 pb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </section>

      {/* Hero */}
      <section className="container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight mb-4">
            The <span className="text-blue-400">7 Levels of Scale</span> Platform
          </h1>
          <p className="text-lg md:text-xl text-slate-200/80 max-w-3xl mx-auto">
            A systematic approach to entrepreneurship. Scale yourself, then scale your company. 
            Break through the flatline with proven frameworks and tools.
          </p>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="container mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Platform Features</h2>
          <p className="text-slate-300/80">Powerful tools designed for entrepreneurs and teams</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div key={idx} className="rounded-xl p-6 bg-white/5 border border-white/10 transition-all hover:bg-white/10">
              <div className="flex items-center gap-2 text-blue-300">
                {f.icon}
                <div className="font-semibold">{f.title}</div>
              </div>
              <div className="mt-2 text-slate-300/80">{f.desc}</div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-300/70">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Included in all plans
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product screenshots */}
      <section id="product-screenshots" className="container mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">See the product in action</h2>
          <p className="mt-2 text-slate-300/80">A glimpse of dashboards and workflows</p>
        </div>
        <Carousel 
          className="mx-auto max-w-5xl"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {productShots?.map((src: any, i: number) => (
              <CarouselItem key={i}>
                <Card className="bg-white/5 border-white/10 backdrop-blur">
                  <CardContent className="p-4">
                    <AspectRatio ratio={16/9}>
                      <img src={src} alt={`Product screenshot ${i+1}`} className="h-full w-full object-cover rounded-lg border border-white/10" loading="lazy" />
                    </AspectRatio>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>

      {/* The Entrepreneurial Lifecycle */}
      <section className="container mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">THE ENTREPRENEURIAL LIFECYCLE</h2>
          <p className="mt-2 text-slate-300/80 text-lg">AN EMOTIONAL ROLLERCOASTER</p>
        </div>
        
        <div className="max-w-6xl mx-auto mb-12">
          {/* The Problem: Scaling vs Starting */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-red-400 mb-4">The Hidden Truth About Business Failure</h3>
              <p className="text-lg text-slate-200 mb-6">Here's what the data shows:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-black text-green-400 mb-2">80%</div>
                  <div className="text-sm text-slate-300">Survive Year 1</div>
                  <div className="text-xs text-green-400">✓ Starting is achievable</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-yellow-400 mb-2">50%</div>
                  <div className="text-sm text-slate-300">Make it to Year 5</div>
                  <div className="text-xs text-yellow-400">⚠ Scaling is harder</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-red-400 mb-2">9%</div>
                  <div className="text-sm text-slate-300">Achieve Long-term Success</div>
                  <div className="text-xs text-red-400">💔 Most get stuck in the flatline</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-500/20 to-emerald-500/20 rounded-lg p-6 border border-emerald-400/30">
              <p className="text-lg font-semibold text-center text-white mb-2">
                <span className="text-red-400">The Real Challenge:</span> It's not starting a business—
                <span className="text-emerald-400 font-bold">it's scaling without burning out</span>
              </p>
              <p className="text-center text-slate-300">Our platform helps you break through the entrepreneurial flatline systematically.</p>
            </div>
          </div>
          
          {/* The Entrepreneurial Lifecycle */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="text-lg text-slate-200 mb-4">The Entrepreneurial Lifecycle Every Founder Experiences:</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
                  <div className="text-blue-400 font-bold mb-2">1. Eureka Moment</div>
                  <div className="text-sm text-slate-300">"This is going to be easy!" Uninformed optimism</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4">
                  <div className="text-purple-400 font-bold mb-2">2. Launch Drudgery</div>
                  <div className="text-sm text-slate-300">"We're all doomed." Reality hits hard</div>
                </div>
                <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
                  <div className="text-green-400 font-bold mb-2">3. Initial Traction</div>
                  <div className="text-sm text-slate-300">"We might have something!" First success</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-4">
                  <div className="text-yellow-400 font-bold mb-2">4. Early Growth</div>
                  <div className="text-sm text-slate-300">"Where's the champagne?" Peak confidence</div>
                </div>
                <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
                  <div className="text-red-400 font-bold mb-2">5. The Flatline</div>
                  <div className="text-sm text-slate-300">"Why isn't this working?" Growth stagnates</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-lg p-4">
                  <div className="text-emerald-400 font-bold mb-2">6. Breakthrough</div>
                  <div className="text-sm text-slate-300">"Informed realism." Systematic scaling</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-emerald-400 mb-4">THE GOAL: Your Level 7 Life</h3>
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg p-6 border border-emerald-400/30">
                  <p className="text-lg font-semibold text-white mb-2">
                    <span className="text-emerald-400 font-bold">DOUBLE</span> your revenue, 
                    <span className="text-emerald-400 font-bold">DOUBLE</span> your take-home profit, 
                    hit your <span className="text-blue-400 font-bold">"number"</span> without burning out
                  </p>
                  <p className="text-slate-300 text-sm mt-2">Scale yourself so you can scale your company</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
          <p className="mt-2 text-slate-300/80">The Ultimate Shortcut/Roadmap of knowing where you are right now and hitting your numbers</p>
        </div>
        
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10 rounded-xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="inline-block bg-green-500 text-black font-bold text-xs px-3 py-1 rounded mb-4">
                THE SYSTEMATIC APPROACH
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">How to Break Through the Flatline</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div className="font-semibold text-blue-400 mb-3">Define Your Number</div>
                <p className="text-sm text-slate-400">
                  Set your revenue target, profit goals, and business valuation. Know exactly 
                  what "success" looks like for you and your family.
                </p>
              </div>
              
              <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div className="font-semibold text-green-400 mb-3">Walk the 7 Levels</div>
                <p className="text-sm text-slate-400">
                  Follow our proven roadmap. Know exactly where you are now and 
                  what specific steps will take you to your next level.
                </p>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div className="font-semibold text-purple-400 mb-3">Scale Systematically</div>
                <p className="text-sm text-slate-400">
                  Execute your Level 7 plan with systems that work without you. 
                  Scale yourself, then scale your company.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-400/30">
                <p className="text-sm font-semibold text-green-400">
                  The result: Break through the flatline without burning out or losing control
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.step} className="rounded-xl p-6 bg-white/5 border border-white/10">
              <div className="text-3xl font-black text-white/10">{s.step}</div>
              <div className="mt-2 text-lg font-semibold">{s.title}</div>
              <div className="mt-1 text-slate-300/80">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Loved by operators and creators</h2>
          <p className="mt-2 text-slate-300/80">What our users are saying</p>
        </div>
        <div className="relative">
          <Carousel className="mx-auto max-w-3xl">
            <CarouselContent>
              {testimonials.map((t, i) => (
                <CarouselItem key={i}>
                  <Card className="bg-white/5 border-white/10 backdrop-blur">
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center gap-4">
                        <Quote className="h-6 w-6 text-blue-300" />
                        <p className="text-lg text-slate-100">"{t.quote}"</p>
                        <Separator className="bg-white/10" />
                        <div className="text-sm text-slate-300/90 font-medium">{t.name} • {t.title}</div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Frequently asked questions</h2>
          <p className="mt-2 text-slate-300/80">Everything you need to know</p>
        </div>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-xl p-2">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="px-4">{f.q}</AccordionTrigger>
              <AccordionContent className="px-4 text-slate-300/90">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA to get started */}
      <section className="container mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-700/40 via-purple-700/30 to-slate-900">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=60"
              alt="Background pattern"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="relative px-6 py-10 md:px-10 md:py-14 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold">Ready to Break Through the Flatline?</h3>
              <p className="mt-2 text-slate-200/80">
                Stop being stuck. Scale yourself to scale your company. Join the 9% that succeed systematically.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSf2n02tzF1Yti8ZiwVDhOjnvPpgCKayNZsuxr4vpRF8DY4TLA/viewform?usp=dialog" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-green-600 text-white hover:bg-green-500 font-semibold">
                  Build My Level 7 Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <Link to="/" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full bg-white text-slate-900 hover:bg-slate-100 border-slate-200">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Product;
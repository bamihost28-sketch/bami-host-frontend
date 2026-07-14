import { Link } from "react-router-dom";
import { BarChart3, Wallet, Users, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf2n02tzF1Yti8ZiwVDhOjnvPpgCKayNZsuxr4vpRF8DY4TLA/viewform?usp=dialog";

const Projects = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <Navbar />

      {/* Hero */}
      <section className="container mx-auto px-6 pt-6 pb-10 md:pb-16">
        <div className="flex items-end justify-between gap-6">
          <div className="stagger-item">
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tighter">Scale Without Burning Out</h1>
            <p className="mt-3 text-slate-200/85 text-lg max-w-2xl">See how entrepreneurs use our platform to break through the flatline and build Level 7 businesses systematically.</p>
          </div>
          <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" className="hidden md:block stagger-item">
            <Button size="lg" className="bg-green-600 hover:bg-green-500 btn-interactive">
              Start your project <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Projects Grid - Asymmetric Layout */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-5 gap-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur liquid-glass stagger-item md:col-span-3 md:row-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base tracking-tighter">
                <BarChart3 className="h-4 w-4 text-green-300" /> The 7 Levels Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300/85">
              Systematic roadmap from startup to Level 7. Know where you are and what's next to hit your numbers.
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur liquid-glass stagger-item md:col-span-2 md:row-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base tracking-tighter">
                <Wallet className="h-4 w-4 text-green-300" /> Scale Your Personal Wealth
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300/85">
              Track the 50/30/20 framework, net worth growth, and personal financial goals while scaling your business.
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur liquid-glass stagger-item md:col-span-2 md:row-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base tracking-tighter">
                <Users className="h-4 w-4 text-emerald-300" /> Systems That Work Without You
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300/85">
              Build teams and processes that scale systematically. Role-based access ensures the right people see the right information.
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur liquid-glass stagger-item md:col-span-3 md:row-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base tracking-tighter">
                <Building2 className="h-4 w-4 text-green-300" /> Build to Sell or Scale
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300/85">
              Whether you're building to sell or building to scale, our framework gives you the clarity and systems to execute.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-green-700/40 via-emerald-700/30 to-slate-900 liquid-glass">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=60"
              alt="Background pattern"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="relative px-6 py-10 md:px-10 md:py-14 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 stagger-item">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tighter">Ready to Break Through the Flatline?</h3>
              <p className="mt-2 text-slate-200/80">Start your Level 7 journey. Scale yourself, then scale your company systematically.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto stagger-item">
              <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-green-600 text-white hover:bg-green-500 font-semibold btn-interactive">Create account</Button>
              </a>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full bg-white text-slate-900 hover:bg-slate-100 border-slate-200 btn-interactive">Log in</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;

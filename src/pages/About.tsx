import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Building2,
  TrendingUp,
  Award,
  Heart,
  Lightbulb,
  CheckCircle2,
  Target,
  Users,
  Shield,
  Sparkles,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf2n02tzF1Yti8ZiwVDhOjnvPpgCKayNZsuxr4vpRF8DY4TLA/viewform?usp=dialog";

const About = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 h-96 w-96 rounded-full bg-green-600/10 blur-3xl" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              The Scalable Company
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We help entrepreneurs <span className="text-green-400 font-semibold">scale themselves</span> so they can 
            <span className="text-green-400 font-semibold">scale their companies</span>—without burning out, 
            losing control, or sacrificing what matters most.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="relative container mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12">
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-6">Our Story: From Success to Breaking Point (and Back)</h2>
                <div className="space-y-6 text-slate-300 leading-relaxed">
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-6 border border-green-400/30">
                    <h3 className="text-xl font-bold text-white mb-3">The Highs</h3>
                    <p className="text-lg">
                      Like many entrepreneurs, we started not to "build a business," but to solve a problem. 
                      The early success was intoxicating—growing companies, hitting milestones, feeling unstoppable.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-6 border border-red-400/30">
                    <h3 className="text-xl font-bold text-white mb-3">The Breaking Point</h3>
                    <p className="text-lg mb-4">
                      But as growth accelerated, so did the sacrifices. Late dinners became routine. Missed family events turned standard. 
                      Weekends blurred into work emails. The breaking point came with this realization:
                    </p>
                    <blockquote className="text-lg font-semibold text-red-200 italic border-l-4 border-red-400 pl-4">
                      "I no longer owned my company. My company owned me."
                    </blockquote>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-lg p-6 border border-emerald-400/30">
                    <h3 className="text-xl font-bold text-white mb-3">The Breakthrough</h3>
                    <p className="text-lg">
                      That's when we discovered the truth: <span className="text-emerald-400 font-semibold">Scaling isn't just about the business—it's about scaling yourself as the founder</span>. 
                      We learned to build systems that worked without us, create frameworks that prevented burnout, 
                      and develop a platform where business success amplifies personal fulfillment, not destroys it.
                    </p>
                  </div>
                  
                  <p className="text-lg font-semibold text-slate-200">
                    The Scalable Company exists because we've been in the trenches. We know what it feels like to be 
                    stuck in the flatline, burned out, and wondering "what's next?" More importantly, we know there's a way out.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/40 transition-all">
            <CardContent className="p-10">
              <div className="w-14 h-14 rounded-xl bg-blue-600/20 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-slate-300 text-lg leading-relaxed">
                Help entrepreneurs <span className="text-blue-400 font-semibold">scale themselves</span> so they can 
                <span className="text-blue-400 font-semibold">scale their companies</span>. Because stronger founders 
                create better teams, healthier families, and thriving economies.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all">
            <CardContent className="p-10">
              <div className="w-14 h-14 rounded-xl bg-purple-600/20 flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-slate-300 text-lg leading-relaxed">
                A world where entrepreneurs break through the flatline without burning out or losing control. 
                Where scaling becomes systematic, not chaotic. Where founders stay at the helm as long as they want—
                building businesses that serve their lives, not consume them.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative container mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Core Values</h2>
          <p className="text-xl text-slate-300">
            The principles that guide everything we build and every decision we make
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">Clarity Over Complexity</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Simple, clear solutions that actually work in the real world
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">User-First Always</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every feature is designed with real entrepreneur needs in mind
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">Scale Yourself First</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transform the founder before transforming the business
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all group">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-orange-600/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">Continuous Innovation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Always evolving to meet the changing needs of entrepreneurs
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="relative container mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">What Makes Us Different</h2>
          <p className="text-xl text-slate-300">
            We're not just another productivity tool—we're a complete system for entrepreneurial success
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Battle-Tested by Founders in the Trenches</h3>
              <p className="text-slate-300 leading-relaxed">
                We've experienced the flatline, the burnout, and the breakthrough. Every system we teach 
                comes from real-world experience scaling companies without losing ourselves.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">The 7 Levels of Scale Framework</h3>
              <p className="text-slate-300 leading-relaxed">
                A systematic roadmap from startup to exit, with clear milestones and strategies 
                for each level—no more guessing what comes next.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Break Through the Flatline</h3>
              <p className="text-slate-300 leading-relaxed">
                Don't just survive the entrepreneurial lifecycle—master it. Turn the emotional 
                rollercoaster into a systematic journey with predictable outcomes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* By The Numbers */}
      <section className="relative container mx-auto px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-green-600/10 backdrop-blur-sm border-white/10">
            <CardContent className="p-12">
              <h2 className="text-xl md:text-2xl font-bold text-center mb-12">By the Numbers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-white mb-2">91%</div>
                  <div className="text-slate-400 text-sm">Business Failure Rate</div>
                  <div className="text-slate-500 text-xs mt-1">We're changing this</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-blue-400 mb-2">7</div>
                  <div className="text-slate-400 text-sm">Growth Levels</div>
                  <div className="text-slate-500 text-xs mt-1">From start to exit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-purple-400 mb-2">3</div>
                  <div className="text-slate-400 text-sm">Core Frameworks</div>
                  <div className="text-slate-500 text-xs mt-1">Proven strategies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-green-400 mb-2">∞</div>
                  <div className="text-slate-400 text-sm">Your Potential</div>
                  <div className="text-slate-500 text-xs mt-1">No limits</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* CTA Section */}
      <section className="relative container mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-white/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=60')] opacity-5 bg-cover bg-center" />
            <CardContent className="relative p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Break Free from the 91%?
              </h2>
              <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of entrepreneurs who are building sustainable, profitable businesses with systematic growth strategies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <Link to="/product">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-semibold">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

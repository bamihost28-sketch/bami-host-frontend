import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Building2,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

const EntrepreneurGuide = () => {
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
            The <span className="text-blue-400">Accidental Entrepreneur</span> Guide
          </h1>
          <p className="text-lg md:text-xl text-slate-200/80 max-w-3xl mx-auto">
            If you're stuck in the entrepreneurial flatline, burned out, or wondering "what's next?"—you're not broken. 
            You're part of the majority who bootstrapped, self-taught, and audience-first. Here's your roadmap forward.
          </p>
        </div>
      </section>

      {/* Accidental Entrepreneurs */}
      <section className="container mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">What's an "Accidental Entrepreneur?"</h2>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Definition */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-3"></div>
                <h3 className="font-bold text-green-400 mb-2">Audience-first</h3>
                <p className="text-sm text-slate-300">They know WHO they serve and HOW to best serve them, and they'll never sacrifice customer delight at the altar of profitability.</p>
              </div>
              
              <div className="text-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-3"></div>
                <h3 className="font-bold text-blue-400 mb-2">Bootstrapped</h3>
                <p className="text-sm text-slate-300">They have raised little or no outside capital.</p>
              </div>
              
              <div className="text-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-3"></div>
                <h3 className="font-bold text-purple-400 mb-2">Self-taught</h3>
                <p className="text-sm text-slate-300">They have little-to-no formal business training and education.</p>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-6">
              <h4 className="text-lg font-semibold text-slate-200 mb-4">Accidental entrepreneurs are:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-green-400 mb-3">1. Audience-First</h5>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">○</span>
                      Didn't set out to "start a business."
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">○</span>
                      Solved a problem they or their audience faced.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">○</span>
                      Care deeply about customer delight and never sacrifice scale over audience value.
                    </li>
                  </ul>
                  
                  <h5 className="font-semibold text-blue-400 mb-3 mt-6">2. Bootstrapped</h5>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">○</span>
                      Raised little or no money.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">○</span>
                      Often didn't know how, didn't want to, or simply didn't need to.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">○</span>
                      Avoid outside funding to <span className="text-yellow-400 font-semibold">keep freedom</span> and avoid outside <span className="text-yellow-400 font-semibold">opinions</span>.
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold text-purple-400 mb-3">3. Self-Taught</h5>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">○</span>
                      Didn't train formally in business.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">○</span>
                      Jumped in headfirst, figured things out along the way.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">○</span>
                      Quick start is an advantage early, but <span className="text-red-400 font-semibold">lack</span> of foundational business skills can later hold them back.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6 text-center">How many accidental entrepreneurs are there?</h3>
              <div className="text-center mb-6">
                <div className="text-sm text-slate-300 mb-2">Out of 32 MILLION entrepreneurs...</div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 font-semibold">70%</span>
                  <span className="text-slate-300 text-sm">launched their company without a formal business plan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-400 font-semibold">91%</span>
                  <span className="text-slate-300 text-sm">don't have a degree in business</span>
                </div>
                <div className="text-slate-400 text-xs ml-6">(44% don't have any college degree)</div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-400 font-semibold">99.95%</span>
                  <span className="text-slate-300 text-sm">didn't raise venture capital</span>
                </div>
                <div className="text-slate-400 text-xs ml-6">(77% didn't raise any outside capital at all)</div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/20">
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• 32 million entrepreneurs in the U.S.</li>
                  <li>• 70% launched without a business plan.</li>
                  <li>• 91% don't have a business degree.</li>
                  <li>• 44% have no college degree at all.</li>
                  <li>• 99.95% didn't raise venture capital.</li>
                  <li>• 77% raised no capital at all.</li>
                </ul>
              </div>
            </div>
            
            {/* The Silent Struggle */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6 text-center">The Silent Struggle</h3>
              
              <div className="text-center mb-6">
                <div className="text-3xl md:text-4xl font-black text-red-400 mb-2">91%</div>
                <div className="text-sm text-slate-400">Eventually fail because they can't break through the scaling flatline</div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Nobody talks about accidental entrepreneurs.</h4>
                  <ul className="space-y-1 text-sm text-slate-300 ml-4">
                    <li>○ Media spotlights funded startups, not bootstrapped founders.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Result: Most get stuck in the entrepreneurial flatline.</h4>
                  <ul className="space-y-1 text-sm text-slate-300 ml-4">
                    <li>○ Growth stagnates despite early success</li>
                    <li>○ Burnout from working harder, not smarter</li>
                    <li>○ Loss of control as business demands increase</li>
                    <li>○ Wondering "what's next?" without a clear roadmap</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Do The Math */}
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-xl p-8 mb-8">
            <div className="text-center">
              <div className="text-sm text-slate-300 mb-2">THE REALITY: Most entrepreneurs are...</div>
              <div className="text-2xl md:text-3xl font-black text-green-400 mb-4">STUCK IN THE FLATLINE</div>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                <span>👉</span>
                <span>But there's a systematic way to break through and scale without burning out.</span>
              </div>
            </div>
          </div>
          
          {/* Core Message */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 text-center">The Core Message</h3>
            <div className="text-center mb-8">
              <div className="text-2xl md:text-3xl font-bold text-slate-200 mb-4">
                WRITE THIS DOWN...
              </div>
              <div className="text-xl md:text-2xl text-slate-200 mb-2">
                You're not stuck because you're <span className="text-red-400 font-bold underline">BROKEN</span>.
              </div>
              <div className="text-xl md:text-2xl text-slate-200 mb-2">
                You're stuck because you don't know how to <span className="text-green-400 font-bold underline">SCALE SYSTEMATICALLY</span>.
              </div>
              <div className="text-lg md:text-xl text-slate-200 mb-2">
                The solution: Scale <span className="text-blue-400 font-bold underline">YOURSELF</span> first,
              </div>
              <div className="text-lg md:text-xl text-slate-200">
                then scale your <span className="text-blue-400 font-bold underline">COMPANY</span>.
              </div>
            </div>
            
            <div className="text-left max-w-lg mx-auto">
              <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg p-6 border border-emerald-400/30 mb-6">
                <h4 className="text-lg font-bold text-emerald-400 mb-3">The Breakthrough Formula:</h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <strong>Define your number:</strong> Know exactly what success looks like
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <strong>Walk the 7 Levels:</strong> Follow a proven roadmap with clear milestones
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <strong>Scale systematically:</strong> Build systems that work without you
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-slate-800/50 rounded-lg border border-white/10">
                <p className="text-sm text-slate-300 italic text-center">
                  "The secret is not working harder—it's scaling yourself so you can scale your company without burning out."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Purpose */}
      <section className="container mx-auto px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10 rounded-xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-green-500 text-black font-bold text-xs px-3 py-1 rounded mb-4">
                OUR PURPOSE
              </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Help entrepreneurs break through
                </h2>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  the <span className="text-red-400">flatline</span> by learning to <span className="text-green-400">scale</span>
                </h3>
                <h4 className="text-2xl md:text-3xl font-bold text-white">
                  themselves, then their companies.
                </h4>
              
              <div className="w-16 h-16 mx-auto mt-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-2xl">$</span>
              </div>
            </div>
          </div>
          
          {/* What Do I Do Next */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6 text-center text-slate-200">
              What Do I Do Next:
            </h3>
            
            <div className="relative">
              <div className="text-4xl md:text-5xl font-black text-slate-700 opacity-30 absolute -top-4 -left-2">
                ""
              </div>
              
              <div className="relative z-10 pt-8">
                <h4 className="text-xl md:text-2xl font-bold text-slate-200 mb-4">
                  "WHAT DO I DO
                </h4>
                <h5 className="text-xl md:text-2xl font-bold text-blue-400 mb-8">
                  <span className="underline">NEXT</span>?"
                </h5>
                
                <div className="space-y-4 text-slate-300">
                  <p className="text-sm leading-relaxed">
                    This is the question that haunts every entrepreneur stuck in the flatline. You've built something meaningful, 
                    but growth has stagnated. You're working harder but not seeing results. You're burned out and losing control.
                  </p>
                  
                  <p className="text-sm leading-relaxed">
                    The answer isn't more hustle or longer hours. The answer is learning to 
                    <span className="text-green-400 font-semibold">scale yourself</span> so you can 
                    <span className="text-green-400 font-semibold">scale your company</span> systematically.
                  </p>
                  
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 mt-6 border border-green-400/30">
                    <p className="text-sm font-semibold text-green-400 mb-2">
                      Break through the flatline with our proven system:
                    </p>
                    <div className="text-sm text-slate-300 space-y-1">
                      <p>1. Define your number (revenue, profit, valuation goals)</p>
                      <p>2. Walk the 7 Levels of Scale (systematic roadmap)</p>
                      <p>3. Execute your Level 7 plan (without burning out)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              <h3 className="text-2xl md:text-3xl font-bold">Ready to build your Level 7 plan?</h3>
              <p className="mt-2 text-slate-200/80">Join the 9% that succeed. Start your entrepreneurial transformation today.</p>
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

export default EntrepreneurGuide;
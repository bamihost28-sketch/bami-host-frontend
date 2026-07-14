import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface FooterProps {
  variant?: "light" | "dark";
}

export const Footer = ({ variant = "dark" }: FooterProps) => {
  const isLight = variant === "light";

  return (
    <footer className={`border-t ${isLight ? "border-slate-100 bg-white" : "border-white/10 bg-black/20 backdrop-blur"}`}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className={`text-lg font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>Bami Host</div>
            </div>
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-300/80"} font-medium`}>
              Manage your life and business portfolios in one place. Built for clarity, control and momentum.
            </p>
          </div>

          <div>
            <div className={`text-sm font-bold mb-4 uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>Product</div>
            <ul className={`space-y-3 text-sm ${isLight ? "text-slate-600" : "text-slate-300/80"} font-medium`}>
              <li><Link to="/" className="hover:text-green-600 transition-colors">Home</Link></li>
              <li><Link to="/marketplace/estate" className="hover:text-green-600 transition-colors">BamiHost Marketplace</Link></li>
              <li><Link to="/product" className="hover:text-green-600 transition-colors">Features</Link></li>
              <li><Link to="/entrepreneur-guide" className="hover:text-green-600 transition-colors">Entrepreneur Guide</Link></li>
            </ul>
          </div>

          <div>
            <div className={`text-sm font-bold mb-4 uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>Company</div>
            <ul className={`space-y-3 text-sm ${isLight ? "text-slate-600" : "text-slate-300/80"} font-medium`}>
              <li><Link to="/about" className="hover:text-green-600 transition-colors">About</Link></li>
              <li><a href="mailto:hello@bamihost.com" className="hover:text-green-600 transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors font-medium opacity-50 cursor-not-allowed">Careers</a></li>
              <li><a href="#" className="hover:text-green-600 transition-colors font-medium opacity-50 cursor-not-allowed">Blog</a></li>
            </ul>
          </div>

          <div>
            <div className={`text-sm font-bold mb-4 uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>Stay up to date</div>
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-300/80"} mb-4 font-medium`}>Get product updates and tips.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                className={`${isLight ? "bg-slate-50 border-slate-100 placeholder:text-slate-400 text-slate-900" : "bg-white/10 border-white/10 placeholder:text-slate-300/60 text-white"} rounded-xl`}
              />
              <Button type="submit" className="bg-green-600 hover:bg-green-700 font-bold px-6 btn-interactive">Subscribe</Button>
            </form>
          </div>
        </div>

        <Separator className={`my-8 ${isLight ? "bg-slate-100" : "bg-white/10"}`} />

        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] ${isLight ? "text-slate-400" : "text-slate-300/70"} font-bold tracking-wider uppercase`}>
          <div>&copy; {new Date().getFullYear()} Bami Host. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-green-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-green-600 transition-colors">Terms</Link>
            <a href="#" className="hover:text-green-600 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

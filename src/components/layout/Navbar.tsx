import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Building2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  variant?: "light" | "dark";
}

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Estate Marketplace", to: "/marketplace/estate" },
  { label: "Product", to: "/product" },
  { label: "Entrepreneur Guide", to: "/entrepreneur-guide" },
  { label: "Projects", to: "/projects" },
  { label: "About Us", to: "/about" },
];

export const Navbar = ({ variant = "dark" }: NavbarProps) => {
  const isLight = variant === "light";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const linkClass = isLight
    ? "text-slate-600 hover:text-blue-600 font-medium transition-colors"
    : "text-white/80 hover:text-white font-medium transition-colors";

  const activeLinkClass = isLight ? "text-blue-600" : "text-white";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        scrolled
          ? isLight
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3"
            : "bg-slate-950/90 backdrop-blur-md border-b border-white/10 shadow-lg py-3"
          : isLight
          ? "bg-white/80 backdrop-blur-sm py-5"
          : "bg-slate-950/60 backdrop-blur-sm py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className={cn("text-lg font-bold tracking-tight", isLight ? "text-slate-900" : "text-white")}>
            BamiHustle
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(linkClass, location.pathname === link.to && activeLinkClass)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button
              variant="outline"
              className={cn(
                "font-semibold",
                isLight
                  ? "border-slate-200 text-slate-900 bg-white hover:bg-slate-50"
                  : "border-white/25 text-white bg-white/10 hover:bg-white/20"
              )}
            >
              Log in
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-xl",
                  isLight ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
                )}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className={cn(
                "w-80 border-l",
                isLight ? "bg-white text-slate-900 border-slate-100" : "bg-slate-950 text-white border-white/10"
              )}
            >
              {/* Mobile brand */}
              <div className="flex items-center gap-3 mb-8 pt-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Building2 className="w-4 w-4 text-white" />
                </div>
                <span className={cn("font-bold tracking-tight", isLight ? "text-slate-900" : "text-white")}>
                  BamiHustle
                </span>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      location.pathname === link.to
                        ? "bg-blue-600 text-white"
                        : isLight
                        ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-8 left-6 right-6 flex flex-col gap-2">
                <Link to="/login" className="w-full">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full font-semibold",
                      isLight ? "border-slate-200 text-slate-900" : "border-white/20 text-white bg-white/5"
                    )}
                  >
                    Log in
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

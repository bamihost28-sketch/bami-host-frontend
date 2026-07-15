import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Settings,
  PieChart,
  Target,
  Building,
  Lock,
  Eye,
  X,
  LogOut,
  ListChecks,
  DollarSign,
  UserCheck,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Combine,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  Radio,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePermissions, useFilteredNavigation } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

interface DashboardSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  requiredPermissions?: string[];
  category?: "core" | "business" | "growth" | "team" | "financial" | "system";
  isPremium?: boolean;
  path?: string;
}

const sidebarItems: SidebarItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, category: "core", requiredPermissions: ["view_overview"], path: "/dashboard/overview" },
  { id: "billionaire-os", label: "Billionaire OS", icon: Rocket, category: "core", requiredPermissions: ["view_big5"], path: "/dashboard/billionaire-os" },
  { id: "defining-your-number", label: "Defining Your Number", icon: ListChecks, category: "core", requiredPermissions: ["view_big5"], path: "/dashboard/defining-your-number" },
  { id: "wallet", label: "Wallet", icon: Wallet, category: "financial", requiredPermissions: ["view_wallet"], isPremium: true, path: "/dashboard/wallet" },
  { id: "portfolio", label: "Investment Portfolio", icon: TrendingUp, category: "financial", requiredPermissions: ["view_portfolio"], isPremium: true, path: "/dashboard/portfolio" },
  { id: "split-tracker", label: "50/30/20 Split", icon: PieChart, category: "financial", requiredPermissions: ["view_split_tracker"], isPremium: true, path: "/dashboard/split-tracker" },
  { id: "goals", label: "Financial Goals", icon: Target, category: "financial", requiredPermissions: ["view_goals"], isPremium: true, path: "/dashboard/goals" },
  { id: "accounting", label: "Accounting", icon: Combine, category: "financial", requiredPermissions: ["view_all_data"], isPremium: true, path: "/dashboard/accounting" },
  { id: "contacts", label: "Contacts", icon: Users, category: "system", requiredPermissions: ["view_contacts"], path: "/dashboard/contacts" },
  { id: "strategic-hiring-planner", label: "Hire Like a Boss", icon: UserCheck, category: "team", requiredPermissions: ["view_strategic_hiring", "view_hiring_triggers"], isPremium: true, path: "/dashboard/strategic-hiring-planner" },
  { id: "managing-like-a-boss", label: "Manage Like a Boss", icon: ShieldCheck, category: "team", requiredPermissions: ["view_managing_like_a_boss"], isPremium: true, path: "/dashboard/managing-like-a-boss" },
  { id: "candidate-management", label: "Candidates", icon: UserCheck, category: "team", requiredPermissions: ["view_strategic_hiring", "manage_candidates"], isPremium: true, path: "/dashboard/candidate-management" },
  { id: "people", label: "People", icon: Users, category: "system", requiredPermissions: ["view_people", "manage_users"], path: "/dashboard/people" },
  { id: "business-types", label: "Business Types", icon: Briefcase, category: "system", requiredPermissions: ["view_business_types", "manage_business_types"], path: "/dashboard/business-types" },
  { id: "library", label: "Library", icon: FileText, category: "system", requiredPermissions: ["view_library"], path: "/dashboard/library" },
  { id: "assistant", label: "Assistant", icon: MessageSquare, category: "system", requiredPermissions: ["view_assistant"], path: "/dashboard/assistant" },
  { id: "settings", label: "Settings", icon: Settings, category: "core", requiredPermissions: ["view_settings"], path: "/dashboard/settings" },
  { id: "estate", label: "Estate Management", icon: Building, category: "business", requiredPermissions: ["view_estate"], isPremium: true, path: "/dashboard/estate" },
  { id: "head-office", label: "Head Office", icon: Briefcase, category: "growth", requiredPermissions: ["view_estate"], path: "/dashboard/head-office" },
  { id: "autopilot", label: "AI Agents", icon: Zap, category: "growth", requiredPermissions: ["view_autopilot"], isPremium: true, path: "/dashboard/autopilot" },
  { id: "ai-ops", label: "AI Ops Room", icon: Radio, category: "growth", requiredPermissions: ["view_autopilot"], isPremium: true, path: "/dashboard/ai-ops" },
  { id: "scale", label: "Scale \u00B7 7 Levels", icon: TrendingUp, category: "growth", requiredPermissions: ["view_autopilot"], isPremium: true, path: "/dashboard/scale" },
  { id: "filling-station", label: "Filling Station", icon: Building, category: "business", requiredPermissions: ["view_filling_station"], isPremium: true, path: "/dashboard/filling-station" },
  { id: "equipment", label: "Equipment Rental", icon: Building, category: "business", requiredPermissions: ["view_equipment"], isPremium: true, path: "/dashboard/equipment" },
  { id: "personal-portfolios", label: "Personal Life", icon: Wallet, category: "financial", requiredPermissions: ["view_personal_portfolios"], isPremium: true, path: "/dashboard/personal-portfolios" },
  { id: "reports", label: "Reports", icon: FileText, category: "financial", requiredPermissions: ["view_reports"], isPremium: true, path: "/dashboard/reports" },
  { id: "transactions", label: "Transactions", icon: DollarSign, category: "financial", requiredPermissions: ["view_all_data"], path: "/dashboard/transactions" },
  { id: "meters", label: "Smart Meters", icon: Zap, category: "business", requiredPermissions: ["view_all_data"], path: "/dashboard/meters" },
  { id: "subscription", label: "Subscription", icon: CreditCard, category: "system", requiredPermissions: ["view_subscription", "manage_subscription"], path: "/dashboard/subscription" },
];

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  core: { label: "Dashboard", icon: LayoutDashboard, color: "text-primary" },
  financial: { label: "Financial", icon: DollarSign, color: "text-success" },
  business: { label: "Business", icon: Briefcase, color: "text-warning" },
  growth: { label: "Growth & AI", icon: Rocket, color: "text-primary" },
  team: { label: "Team", icon: UserCheck, color: "text-success" },
  system: { label: "System", icon: Settings, color: "text-muted-foreground" },
};

const CATEGORY_ORDER = ["core", "business", "growth", "team", "financial", "system"];

export const DashboardSidebar = ({
  currentView,
  onViewChange,
  isOpen = true,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) => {
  const { userRole, canAccessNavigation, rolePriority } = usePermissions();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);

  // Escape key closes mobile sidebar
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const filteredItems = useFilteredNavigation(sidebarItems);

  const handleNavigation = (item: SidebarItem) => {
    if (!canAccessNavigation(item.id)) return;
    if (item.path) {
      navigate(item.path);
    } else {
      onViewChange(item.id);
    }
    onClose?.();
  };

  const groupedItems = Object.fromEntries(
    CATEGORY_ORDER.map((cat) => [cat, filteredItems.filter((item) => item.category === cat)])
  ) as Record<string, SidebarItem[]>;

  const activeCategory =
    filteredItems.find(
      (item) => (item.path && location.pathname === item.path) || currentView === item.id
    )?.category ?? "core";

  const [openSections, setOpenSections] = useState<Set<string>>(new Set([activeCategory]));

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const NavItem = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon;
    const hasAccess = canAccessNavigation(item.id);
    const isActive = (item.path && location.pathname === item.path) || currentView === item.id;

    const button = (
      <button
        key={item.id}
        onClick={() => hasAccess && handleNavigation(item)}
        disabled={!hasAccess}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200 group relative",
          isActive && "bg-primary/10 text-foreground",
          !hasAccess && "opacity-40 cursor-not-allowed",
          hasAccess && !isActive && "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full" />
        )}
        <Icon
          className={cn(
            "w-4 h-4 shrink-0 transition-colors duration-200",
            isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
            !hasAccess && "text-sidebar-foreground/30"
          )}
        />
        <span className="flex-1 text-[13px] font-medium truncate">{item.label}</span>
        {!hasAccess && <Lock className="w-3 h-3 text-sidebar-foreground/30 shrink-0" />}
        {hasAccess && rolePriority < 40 && <Eye className="w-3 h-3 text-blue-400/60 shrink-0" />}
      </button>
    );

    if (!hasAccess) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">Access restricted for {userRole}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return button;
  };

  const NavSection = ({ title, sectionKey, items }: { title: string; sectionKey: string; items: SidebarItem[] }) => {
    if (items.length === 0) return null;
    const sectionOpen = openSections.has(sectionKey);
    const config = categoryConfig[sectionKey];
    const SectionIcon = config?.icon;
    const hasActiveItem = items.some(
      (item) => (item.path && location.pathname === item.path) || currentView === item.id
    );

    return (
      <div className="mb-0.5">
        <button
          onClick={() => toggleSection(sectionKey)}
          aria-expanded={sectionOpen}
          aria-controls={`sidebar-section-${sectionKey}`}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 group",
            hasActiveItem ? "text-sidebar-foreground/90" : "text-sidebar-foreground/40 hover:text-sidebar-foreground/60"
          )}
        >
          {SectionIcon && <SectionIcon className={cn("w-3.5 h-3.5 shrink-0", config.color, "opacity-60")} />}
          <span className="flex-1 text-left text-[10px] font-bold uppercase tracking-[0.08em]">{title}</span>
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform duration-200 shrink-0 opacity-40",
              sectionOpen ? "rotate-0" : "-rotate-90"
            )}
          />
        </button>
        {sectionOpen && (
          <div id={`sidebar-section-${sectionKey}`} className="mt-0.5 ml-1 space-y-0.5">
            {items.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const CollapsedDropdown = ({ category, items }: { category: string; items: SidebarItem[] }) => {
    if (items.length === 0) return null;
    const config = categoryConfig[category];
    const CatIcon = config.icon;
    const hasAnyActive = items.some(
      (item) => (item.path && location.pathname === item.path) || currentView === item.id
    );

    return (
      <DropdownMenu key={category}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative",
                    hasAnyActive
                      ? "bg-primary/15 text-primary"
                      : "text-sidebar-foreground/40 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent"
                  )}
                >
                  <CatIcon className="w-[18px] h-[18px]" />
                  {hasAnyActive && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium text-xs">
              {config.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-52 bg-popover border-border shadow-xl">
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-1">
            {config.label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          {items.map((item) => {
            const Icon = item.icon;
            const hasAccess = canAccessNavigation(item.id);
            const isActive = (item.path && location.pathname === item.path) || currentView === item.id;
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => hasAccess && handleNavigation(item)}
                disabled={!hasAccess}
                className={cn(
                  "gap-2.5 cursor-pointer text-muted-foreground focus:text-foreground focus:bg-accent",
                  isActive && "bg-primary/10 text-foreground font-medium",
                  !hasAccess && "opacity-40 cursor-not-allowed"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : config.color)} />
                <span className="flex-1 text-xs">{item.label}</span>
                {!hasAccess && <Lock className="w-3 h-3 text-muted-foreground/50" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside
        ref={sidebarRef}
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-out",
          "fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] z-50",
          "md:top-0 md:h-screen md:shadow-sidebar",
          "overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent print:hidden",
          isCollapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center py-4 gap-1.5 h-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow-green mb-3 shrink-0">
              <span className="text-white font-bold text-sm font-display">B</span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1 w-full px-2 overflow-y-auto">
              {(Object.keys(groupedItems) as Array<keyof typeof groupedItems>).map((cat) =>
                CollapsedDropdown({ category: cat, items: groupedItems[cat] })
              )}
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={logout}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-[18px] h-[18px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sign Out</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggleCollapse}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Expand sidebar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <div className="p-3 h-full flex flex-col">
            <div className="md:hidden mb-3 flex justify-end">
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
                <X className="w-4 h-4 text-sidebar-foreground/60" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-5 px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow-green shrink-0">
                  <span className="text-white font-bold text-sm font-display">B</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-sidebar-foreground leading-tight font-display tracking-tight">Bami Host</p>
                  <p className="text-[10px] text-sidebar-foreground/50 leading-tight capitalize">{userRole?.replace(/_/g, " ")}</p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggleCollapse}
                      className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Collapse</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-sidebar-border">
              {NavSection({ title: "Dashboard", sectionKey: "core", items: groupedItems.core })}
              {NavSection({ title: "Business", sectionKey: "business", items: groupedItems.business })}
              {NavSection({ title: "Growth & AI", sectionKey: "growth", items: groupedItems.growth })}
              {NavSection({ title: "Team", sectionKey: "team", items: groupedItems.team })}
              {NavSection({ title: "Financial", sectionKey: "financial", items: groupedItems.financial })}
              {NavSection({ title: "System", sectionKey: "system", items: groupedItems.system })}
            </nav>

            <div className="mt-3 pt-3 border-t border-sidebar-border space-y-3 shrink-0">
              <div className="px-2">
                <div className="flex justify-between items-center text-[11px] mb-1.5">
                  <span className="text-sidebar-foreground/40 font-medium">Features</span>
                  <span className="font-bold text-primary">{filteredItems.length}/{sidebarItems.length}</span>
                </div>
                <div className="w-full bg-sidebar-accent rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                    style={{ width: `${(filteredItems.length / sidebarItems.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-sidebar-accent/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-semibold font-display">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</div>
                  <div className="text-[10px] text-sidebar-foreground/40 capitalize">{userRole?.replace(/_/g, " ")}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-sidebar-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-0 right-0 w-[2px] h-full pointer-events-none sidebar-pulse" />
      </aside>
    </>
  );
};

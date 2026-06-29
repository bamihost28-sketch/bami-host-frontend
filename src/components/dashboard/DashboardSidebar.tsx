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
  Crown,
  Lock,
  Eye,
  X,
  LogOut,
  ListChecks,
  DollarSign,
  UserCheck,
  TrendingDown,
  Scale,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Handshake,
  Combine,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  Rocket,
  Palette,
  Megaphone,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useState } from "react";

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
  category?: 'core' | 'business' | 'financial' | 'system';
  isPremium?: boolean;
  path?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    category: 'core',
    requiredPermissions: ['view_overview'],
    path: '/dashboard/overview'
  },
  {
    id: "billionaire-os",
    label: "Billionaire OS",
    icon: Rocket,
    category: 'core',
    requiredPermissions: ['view_overview'],
    path: '/dashboard/billionaire-os'
  },
  {
    id: "defining-your-number",
    label: "Defining Your Number",
    icon: ListChecks,
    category: 'core',
    requiredPermissions: ['view_big5'],
    path: '/dashboard/defining-your-number'
  },
  {
    id: "scalable-impact-planner",
    label: "Scalable Impact Planner",
    icon: Scale,
    category: 'core',
    requiredPermissions: ['view_scalable_impact'],
    isPremium: true,
    path: '/dashboard/ScalableImpactPlanner'
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    category: 'financial',
    requiredPermissions: ['view_wallet'],
    isPremium: true,
    path: '/dashboard/wallet'
  },
  {
    id: "portfolio",
    label: "Investment Portfolio",
    icon: TrendingUp,
    category: 'financial',
    requiredPermissions: ['view_portfolio'],
    isPremium: true,
    path: '/dashboard/portfolio'
  },
  {
    id: "split-tracker",
    label: "50/30/20 Split",
    icon: PieChart,
    category: 'financial',
    requiredPermissions: ['view_split_tracker'],
    isPremium: true,
    path: '/dashboard/split-tracker'
  },
  {
    id: "goals",
    label: "Financial Goals",
    icon: Target,
    category: 'financial',
    requiredPermissions: ['view_goals'],
    isPremium: true,
    path: '/dashboard/goals'
  },
  {
    id: "accounting",
    label: "Accounting Management",
    icon: Combine,
    category: 'financial',
    requiredPermissions: ['view_all_data'],
    isPremium: true,
    path: '/dashboard/accounting'
  },
  {
    id: "contacts",
    label: "Contacts",
    icon: Users,
    category: 'system',
    requiredPermissions: ['view_contacts'],
    path: '/dashboard/contacts'
  },
  {
    id: "strategic-hiring-planner",
    label: "Hire Like a Boss",
    icon: Crown,
    category: 'business',
    requiredPermissions: ['view_strategic_hiring', 'view_hiring_triggers'],
    isPremium: true,
    path: '/dashboard/strategic-hiring-planner'
  },
  {
    id: "managing-like-a-boss",
    label: "Manage Like a Boss",
    icon: ShieldCheck,
    category: 'business',
    requiredPermissions: ['view_managing_like_a_boss'],
    isPremium: true,
    path: '/dashboard/managing-like-a-boss'
  },
  {
    id: "candidate-management",
    label: "Candidates",
    icon: UserCheck,
    category: 'business',
    requiredPermissions: ['view_strategic_hiring', 'manage_candidates'],
    isPremium: true,
    path: '/dashboard/candidate-management'
  },
  {
    id: "people",
    label: "People",
    icon: Users,
    category: 'system',
    requiredPermissions: ['view_people', 'manage_users'],
    path: '/dashboard/people'
  },
  {
    id: "business-types",
    label: "Business Types",
    icon: Briefcase,
    category: 'system',
    requiredPermissions: ['view_business_types', 'manage_business_types'],
    path: '/dashboard/business-types'
  },
  {
    id: "library",
    label: "Library",
    icon: FileText,
    category: 'system',
    requiredPermissions: ['view_library'],
    path: '/dashboard/library'
  },
  {
    id: "assistant",
    label: "Assistant",
    icon: MessageSquare,
    category: 'system',
    requiredPermissions: ['view_assistant'],
    path: '/dashboard/assistant'
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    category: 'core',
    requiredPermissions: ['view_settings'],
    path: '/dashboard/settings'
  },
  {
    id: "estate",
    label: "Estate Management",
    icon: Building,
    category: 'business',
    requiredPermissions: ['view_estate'],
    isPremium: true,
    path: '/dashboard/estate'
  },
  {
    id: "skills-designer",
    label: "Designer Skill",
    icon: Palette,
    category: 'business',
    requiredPermissions: ['view_designer_skill'],
    isPremium: true,
    path: '/dashboard/skills/designer'
  },
  {
    id: "skills-marketing",
    label: "Marketer Skill",
    icon: Megaphone,
    category: 'business',
    requiredPermissions: ['view_marketing_skill'],
    isPremium: true,
    path: '/dashboard/skills/marketing'
  },
  {
    id: "skills-sales",
    label: "Sales Skill",
    icon: TrendingUp,
    category: 'business',
    requiredPermissions: ['view_sales_skill'],
    isPremium: true,
    path: '/dashboard/skills/sales'
  },
  {
    id: "skills-finance",
    label: "Finance Director",
    icon: DollarSign,
    category: 'financial',
    requiredPermissions: ['view_finance_skill'],
    isPremium: true,
    path: '/dashboard/skills/finance'
  },
  {
    id: "skills-operations",
    label: "Operations Skill",
    icon: Settings2,
    category: 'business',
    requiredPermissions: ['view_operations_skill'],
    isPremium: true,
    path: '/dashboard/skills/operations'
  },
  {
    id: "skills-hr",
    label: "HR Director",
    icon: Users,
    category: 'business',
    requiredPermissions: ['view_hr_skill'],
    isPremium: true,
    path: '/dashboard/skills/hr'
  },
  {
    id: "autopilot",
    label: "Business Autopilot",
    icon: Zap,
    category: 'business',
    requiredPermissions: ['view_autopilot'],
    isPremium: true,
    path: '/dashboard/autopilot'
  },
  {
    id: "filling-station",
    label: "Filling Station",
    icon: Building,
    category: 'business',
    requiredPermissions: ['view_filling_station'],
    isPremium: true,
    path: '/dashboard/filling-station'
  },
  {
    id: "equipment",
    label: "Equipment Rental",
    icon: Building,
    category: 'business',
    requiredPermissions: ['view_equipment'],
    isPremium: true,
    path: '/dashboard/equipment'
  },
  {
    id: "personal-portfolios",
    label: "Personal Life",
    icon: Crown,
    category: 'financial',
    requiredPermissions: ['view_personal_portfolios'],
    isPremium: true,
    path: '/dashboard/personal-portfolios'
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    category: 'financial',
    requiredPermissions: ['view_reports'],
    isPremium: true,
    path: '/dashboard/reports'
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: DollarSign,
    category: 'financial',
    requiredPermissions: ['view_all_data'],
    path: '/dashboard/transactions'
  },
  {
    id: "meters",
    label: "Smart Meters",
    icon: Zap,
    category: 'financial',
    requiredPermissions: ['view_all_data'],
    path: '/dashboard/meters'
  },
  {
    id: "subscription",
    label: "Subscription",
    icon: CreditCard,
    category: 'system',
    requiredPermissions: ['view_subscription', 'manage_subscription'],
    path: '/dashboard/subscription'
  }
];

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  core: { label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-400' },
  financial: { label: 'Financial', icon: DollarSign, color: 'text-emerald-400' },
  business: { label: 'Business', icon: Briefcase, color: 'text-amber-400' },
  system: { label: 'System', icon: Settings, color: 'text-purple-400' },
};

export const DashboardSidebar = ({
  currentView,
  onViewChange,
  isOpen = true,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) => {
  const { userRole, hasPermission, canAccessNavigation, rolePriority } = usePermissions();
  const { user, logout } = useAuth();
  const isTenant = user?.role === 'tenant';
  const navigate = useNavigate();
  const location = useLocation();

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

  const groupedItems = {
    core: filteredItems.filter(item => item.category === 'core'),
    financial: filteredItems.filter(item => item.category === 'financial'),
    business: filteredItems.filter(item => item.category === 'business'),
    system: filteredItems.filter(item => item.category === 'system'),
  };

  // Determine which section is active so we can open it by default
  const activeCategory = filteredItems.find(
    item => (item.path && location.pathname === item.path) || currentView === item.id
  )?.category ?? 'core';

  const [openSections, setOpenSections] = useState<Set<string>>(new Set([activeCategory]));

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderExpandedItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const hasAccess = canAccessNavigation(item.id);
    const isActive = (item.path && location.pathname === item.path) || currentView === item.id;

    const button = (
      <Button
        key={item.id}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 text-left relative transition-all duration-200 group h-10 px-3 rounded-lg mx-1",
          "hover:bg-slate-700/70 hover:text-slate-100",
          isActive && "bg-gradient-to-r from-blue-600/40 to-purple-600/20 text-white shadow-lg border border-blue-500/30",
          !hasAccess && "opacity-50 cursor-not-allowed hover:bg-transparent",
          hasAccess && !isActive && "text-slate-300 hover:text-white"
        )}
        onClick={() => hasAccess && handleNavigation(item)}
        disabled={!hasAccess}
      >
        <Icon className={cn(
          "w-4 h-4 shrink-0 transition-transform duration-200",
          isActive && "text-blue-400 scale-110",
          !hasAccess && "text-slate-500",
          hasAccess && !isActive && "group-hover:text-blue-400 group-hover:scale-105"
        )} />
        <span className="flex-1 font-medium truncate">{item.label}</span>
        {!hasAccess && <Lock className="w-3 h-3 text-slate-500 shrink-0" />}
        {item.isPremium && hasAccess && rolePriority >= 60 && (
          <Crown className="w-3 h-3 text-yellow-400 animate-pulse shrink-0" />
        )}
        {hasAccess && rolePriority < 40 && (
          <Eye className="w-3 h-3 text-blue-400 shrink-0" />
        )}
        {isActive && (
          <div className="absolute right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        )}
      </Button>
    );

    if (!hasAccess) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">
              <p>Access restricted for {userRole} role</p>
              {item.requiredPermissions && (
                <p className="text-xs opacity-75">Required: {item.requiredPermissions.join(', ')}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  const renderExpandedSection = (title: string, sectionKey: string, items: SidebarItem[]) => {
    if (items.length === 0) return null;
    const isOpen = openSections.has(sectionKey);
    const config = categoryConfig[sectionKey];
    const SectionIcon = config?.icon;
    const hasActiveItem = items.some(
      item => (item.path && location.pathname === item.path) || currentView === item.id
    );

    return (
      <div key={sectionKey} className="mb-1">
        {/* Clickable section header */}
        <button
          onClick={() => toggleSection(sectionKey)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group",
            "hover:bg-slate-700/40",
            hasActiveItem && !isOpen && "bg-slate-700/30"
          )}
        >
          {SectionIcon && (
            <SectionIcon className={cn("w-3.5 h-3.5 shrink-0", config.color)} />
          )}
          <span className={cn(
            "flex-1 text-left text-[10px] font-bold uppercase tracking-widest",
            hasActiveItem ? "text-slate-300" : "text-slate-500",
            "group-hover:text-slate-300"
          )}>
            {title}
          </span>
          <span className="text-[10px] text-slate-600 mr-1">{items.length}</span>
          <ChevronDown className={cn(
            "w-3 h-3 text-slate-500 transition-transform duration-200 shrink-0",
            isOpen ? "rotate-0" : "-rotate-90"
          )} />
        </button>

        {/* Collapsible items */}
        {isOpen && (
          <div className="mt-0.5 space-y-0.5 pl-1">
            {items.map(renderExpandedItem)}
          </div>
        )}
      </div>
    );
  };

  const renderCollapsedSection = (category: string, items: SidebarItem[]) => {
    if (items.length === 0) return null;
    const config = categoryConfig[category];
    const CatIcon = config.icon;
    const hasAnyActive = items.some(
      item => (item.path && location.pathname === item.path) || currentView === item.id
    );

    return (
      <DropdownMenu key={category}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-10 h-10 rounded-lg transition-all duration-200 relative",
                    hasAnyActive
                      ? "bg-gradient-to-br from-blue-600/40 to-purple-600/20 text-white border border-blue-500/30"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/70"
                  )}
                >
                  <CatIcon className={cn("w-5 h-5", config.color)} />
                  {hasAnyActive && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {config.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={8}
          className="w-56 bg-slate-900 border-slate-700 shadow-2xl"
        >
          <DropdownMenuLabel className={cn("text-xs font-bold uppercase tracking-wider pb-1", config.color)}>
            {config.label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700" />
          {items.map(item => {
            const Icon = item.icon;
            const hasAccess = canAccessNavigation(item.id);
            const isActive = (item.path && location.pathname === item.path) || currentView === item.id;
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => hasAccess && handleNavigation(item)}
                disabled={!hasAccess}
                className={cn(
                  "gap-2.5 cursor-pointer text-slate-300 focus:text-white focus:bg-slate-700",
                  isActive && "bg-blue-600/20 text-white font-medium",
                  !hasAccess && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-400" : config.color)} />
                <span className="flex-1">{item.label}</span>
                {!hasAccess && <Lock className="w-3 h-3 text-slate-500" />}
                {item.isPremium && hasAccess && <Crown className="w-3 h-3 text-yellow-400" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 ease-in-out",
        "fixed left-0 top-16 h-[calc(100vh-4rem)] z-50 shadow-xl",
        "md:top-0 md:h-screen",
        "overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 print:hidden",
        isCollapsed ? "w-16" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {isCollapsed ? (
          /* ── COLLAPSED MODE ── */
          <div className="flex flex-col items-center py-4 gap-2 h-full">
            {/* Brand icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-md mb-2 shrink-0">
              <span className="text-white font-bold text-sm">B</span>
            </div>

            {/* Category group dropdowns */}
            <div className="flex flex-col items-center gap-1.5 flex-1 w-full px-3 overflow-y-auto">
              {(Object.keys(groupedItems) as Array<keyof typeof groupedItems>).map(cat =>
                renderCollapsedSection(cat, groupedItems[cat])
              )}
            </div>

            {/* Logout icon */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="w-10 h-10 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Toggle expand button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="w-10 h-10 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/70 shrink-0 mt-1"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          /* ── EXPANDED MODE ── */
          <div className="p-4 h-full flex flex-col">
            {/* Mobile close button */}
            <div className="md:hidden mb-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-slate-700/50">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Header: brand + collapse toggle */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-md shrink-0">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100 leading-tight">Bami Hustle</p>
                  <p className="text-[10px] text-slate-400 leading-tight capitalize">{userRole} Portal</p>
                </div>
              </div>
              {/* Desktop collapse toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleCollapse}
                      className="hidden md:flex w-7 h-7 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700/70"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Collapse sidebar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Access level badge */}
            <div className="mb-5 px-3 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span className="text-xs font-medium text-slate-300">Access Level</span>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs font-medium">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
              {renderExpandedSection("Dashboard", "core", groupedItems.core)}
              {renderExpandedSection("Financial", "financial", groupedItems.financial)}
              {renderExpandedSection("Business", "business", groupedItems.business)}
              {renderExpandedSection("System", "system", groupedItems.system)}
            </nav>

            {/* Mobile: user info + logout */}
            <div className="md:hidden mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-100 truncate">{user?.name}</div>
                  <div className="text-xs text-slate-400 capitalize">{userRole}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { logout(); onClose?.(); }}
                className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>

            {/* Access summary */}
            {!isTenant && (
              <div className="mt-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex-shrink-0">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-400 font-medium">Features</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-bold text-green-400">{filteredItems.length}/{sidebarItems.length}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${(filteredItems.length / sidebarItems.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

import { ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Page Header ────────────────────────────────────────────────── */
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
}

export const PageHeader = ({ title, description, icon: Icon, children }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      )}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground font-display tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
    {children && <div className="flex items-center gap-2">{children}</div>}
  </div>
);

/* ── Section Header ─────────────────────────────────────────────── */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export const SectionHeader = ({ title, subtitle, action, className }: SectionHeaderProps) => (
  <div className={cn("flex items-center justify-between mb-4", className)}>
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-display">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground/60 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* ── Stat Card ──────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  change?: number;
  changeLabel?: string;
  variant?: "default" | "green" | "amber" | "red";
  className?: string;
}

export const StatCard = ({ label, value, icon: Icon, change, changeLabel, variant = "default", className }: StatCardProps) => {
  const variantClasses = {
    default: "stat-card",
    green: "stat-card-green",
    amber: "stat-card-amber",
    red: "stat-card-red",
  };

  return (
    <div className={cn(variantClasses[variant], "flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            variant === "green" && "bg-primary/10",
            variant === "amber" && "bg-warning/10",
            variant === "red" && "bg-destructive/10",
            variant === "default" && "bg-muted"
          )}>
            <Icon className={cn(
              "w-4 h-4",
              variant === "green" && "text-primary",
              variant === "amber" && "text-warning",
              variant === "red" && "text-destructive",
              variant === "default" && "text-muted-foreground"
            )} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-foreground font-display tracking-tight">{value}</span>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            change > 0 && "text-success",
            change < 0 && "text-destructive",
            change === 0 && "text-muted-foreground"
          )}>
            {change > 0 && <TrendingUp className="w-3 h-3" />}
            {change < 0 && <TrendingDown className="w-3 h-3" />}
            {change === 0 && <Minus className="w-3 h-3" />}
            <span>{Math.abs(change)}%</span>
            {changeLabel && <span className="text-muted-foreground font-normal">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Metric Grid ────────────────────────────────────────────────── */
interface MetricGridProps {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export const MetricGrid = ({ children, cols = 4, className }: MetricGridProps) => (
  <div className={cn(
    "grid gap-4",
    cols === 2 && "grid-cols-1 sm:grid-cols-2",
    cols === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    className
  )}>
    {children}
  </div>
);

/* ── Empty State ────────────────────────────────────────────────── */
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground/50" />
      </div>
    )}
    <h3 className="text-base font-semibold text-foreground font-display mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/* ── Data Table Wrapper ─────────────────────────────────────────── */
interface DataTableCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const DataTableCard = ({ title, subtitle, action, children, className }: DataTableCardProps) => (
  <div className={cn("dash-card overflow-hidden", className)}>
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground font-display">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="overflow-x-auto -mx-5 px-5">{children}</div>
  </div>
);

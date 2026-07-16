import {
  Building,
  Users,
  Home,
  DollarSign,
  AlertCircle,
  Activity,
  TrendingUp,
  Zap,
  Wrench,
  MessageSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDashboardOverviewQuery } from "@/services/estatesApi";
import { formatCurrencyIntl as formatCurrency, formatDateNg as formatDate } from "@/utils/propertyUtils";
import { PageHeader, StatCard, MetricGrid, SectionHeader } from "./DashboardPrimitives";

// One emoji per AI department, so the activity feed reads like the Head
// Office boardroom rather than a raw log line.
const SKILL_EMOJI: Record<string, string> = {
  gm: "🧭", analyst: "📊", operations: "🔧", metering: "⚡", legal: "⚖️",
  support: "💬", procurement: "🧾", compliance: "📋", finance: "💰",
  collections: "⏰", retention: "🔁", sales: "💼", marketer: "📣",
  designer: "🎨", hr: "👥", records: "🗂️",
};

export const OwnerDashboard: React.FC = () => {
  const { data, isLoading, isError } = useGetDashboardOverviewQuery();
  const overview: any = (data as any)?.data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="dash-card flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" /> Failed to load the system overview.
      </div>
    );
  }

  const totals = overview.totals || {};
  const businessLines: string[] = overview.businessLines || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Overview"
        description="The full picture across every business line — real numbers, updated live"
        icon={Building}
      />

      {businessLines.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 -mt-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Business lines:</span>
          {businessLines.map((line) => (
            <span key={line} className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">
              {line}
            </span>
          ))}
        </div>
      )}

      <MetricGrid cols={4}>
        <StatCard label="Estates" value={totals.estates ?? 0} icon={Building} variant="green" />
        <StatCard label="Units" value={totals.units ?? 0} icon={Home} variant="green" />
        <StatCard label="Occupied" value={`${overview.occupancyRate ?? 0}%`} icon={Activity} variant="green" />
        <StatCard label="Vacant" value={totals.vacant ?? 0} icon={Home} variant="amber" />
        <StatCard label="Tenants" value={totals.tenants ?? 0} icon={Users} variant="green" />
        <StatCard label="Platform Users" value={totals.users ?? 0} icon={Users} />
        {totals.meters > 0 && (
          <StatCard label="Smart Meters" value={totals.meters} icon={Zap} variant="green" />
        )}
        <StatCard label="Overdue Tenants" value={overview.overdueTenants ?? 0} icon={AlertCircle} variant={overview.overdueTenants ? "red" : "default"} />
      </MetricGrid>

      <SectionHeader title="Revenue & Outstanding" />
      <MetricGrid cols={4}>
        <StatCard label="Revenue (all-time)" value={formatCurrency(overview.revenue?.allTime ?? 0)} icon={TrendingUp} variant="green" />
        <StatCard label="Revenue (30 days)" value={formatCurrency(overview.revenue?.last30Days ?? 0)} icon={DollarSign} variant="green" />
        <StatCard label="Outstanding Rent" value={formatCurrency(overview.outstanding?.rent ?? 0)} icon={AlertCircle} variant="amber" />
        <StatCard label="Outstanding Service" value={formatCurrency(overview.outstanding?.service ?? 0)} icon={AlertCircle} variant="amber" />
      </MetricGrid>

      <SectionHeader title="Operations" />
      <MetricGrid cols={3}>
        <StatCard label="Open Issues" value={overview.issues?.open ?? 0} icon={Wrench} variant={overview.issues?.open ? "amber" : "default"} />
        <StatCard label="High-Priority Issues" value={overview.issues?.highPriority ?? 0} icon={AlertCircle} variant={overview.issues?.highPriority ? "red" : "default"} />
        <StatCard label="Pending Enquiries" value={overview.pendingEnquiries ?? 0} icon={MessageSquare} />
      </MetricGrid>

      <SectionHeader title="AI Team Activity" subtitle="What the agent team has been doing across the business" />
      <div className="dash-card">
        {(overview.recentActivity || []).length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No AI team activity yet.</p>
        ) : (
          <div className="space-y-2">
            {(overview.recentActivity || []).map((a: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-sm">
                    {SKILL_EMOJI[a.skill] || "🤖"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</p>
                  </div>
                </div>
                {a.priority === "high" && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive shrink-0">High</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

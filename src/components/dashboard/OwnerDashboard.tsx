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
  Briefcase,
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

// BamiHost manages MANY businesses — Real Estate is only one line, and more
// get added over time. Each active line gets its OWN section with metrics
// that actually fit it; a line with no dedicated renderer below still shows
// via the generic fallback, so a brand-new business line never breaks this
// page or gets silently dropped.

function RealEstateSection({ data }: { data: any }) {
  return (
    <>
      <SectionHeader title="Real Estate" subtitle={`${data.estates ?? 0} estate(s)`} />
      <MetricGrid cols={4}>
        <StatCard label="Units" value={data.units ?? 0} icon={Home} variant="green" />
        <StatCard label="Occupied" value={`${data.occupancyRate ?? 0}%`} icon={Activity} variant="green" />
        <StatCard label="Vacant" value={data.vacant ?? 0} icon={Home} variant="amber" />
        <StatCard label="Tenants" value={data.tenants ?? 0} icon={Users} variant="green" />
        <StatCard label="Overdue Tenants" value={data.overdueTenants ?? 0} icon={AlertCircle} variant={data.overdueTenants ? "red" : "default"} />
        <StatCard label="Outstanding Rent" value={formatCurrency(data.outstanding?.rent ?? 0)} icon={AlertCircle} variant="amber" />
        <StatCard label="Outstanding Service" value={formatCurrency(data.outstanding?.service ?? 0)} icon={AlertCircle} variant="amber" />
        <StatCard label="Open Issues" value={data.openIssues ?? 0} icon={Wrench} variant={data.openIssues ? "amber" : "default"} />
        <StatCard label="High-Priority Issues" value={data.highPriorityIssues ?? 0} icon={AlertCircle} variant={data.highPriorityIssues ? "red" : "default"} />
        <StatCard label="Pending Enquiries" value={data.pendingEnquiries ?? 0} icon={MessageSquare} />
      </MetricGrid>
    </>
  );
}

function SmartMeteringSection({ data }: { data: any }) {
  return (
    <>
      <SectionHeader title="Smart Metering" subtitle={`${data.meters ?? 0} meter(s)`} />
      <MetricGrid cols={3}>
        <StatCard label="Online" value={data.online ?? 0} icon={Zap} variant="green" />
        <StatCard label="Offline" value={data.offline ?? 0} icon={AlertCircle} variant={data.offline ? "red" : "default"} />
        <StatCard label="Low Credit" value={data.lowCredit ?? 0} icon={AlertCircle} variant={data.lowCredit ? "amber" : "default"} />
      </MetricGrid>
    </>
  );
}

// Any business line without a dedicated section above still renders here —
// a plain key/value grid — so a newly added line is never invisible.
function GenericLineSection({ name, data }: { name: string; data: any }) {
  const entries = Object.entries(data || {}).filter(([, v]) => typeof v === "number" || typeof v === "string");
  if (entries.length === 0) return null;
  const label = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
  return (
    <>
      <SectionHeader title={name} />
      <MetricGrid cols={4}>
        {entries.map(([k, v]) => (
          <StatCard key={k} label={label(k)} value={v as string | number} icon={Briefcase} />
        ))}
      </MetricGrid>
    </>
  );
}

const LINE_RENDERERS: Record<string, (data: any) => JSX.Element> = {
  "Real Estate": (data) => <RealEstateSection data={data} />,
  "Smart Metering": (data) => <SmartMeteringSection data={data} />,
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

  const company = overview.company || {};
  const lines: Record<string, any> = overview.lines || {};
  const lineNames: string[] = overview.businessLines || Object.keys(lines);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Overview"
        description="The full picture across every business line — real numbers, updated live"
        icon={Building}
      />

      {lineNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 -mt-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Business lines:</span>
          {lineNames.map((line) => (
            <span key={line} className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">
              {line}
            </span>
          ))}
        </div>
      )}

      {/* Company-wide — applies across every business line, not just one */}
      <SectionHeader title="Company" subtitle="Whole-business numbers, not tied to a single line" />
      <MetricGrid cols={3}>
        <StatCard label="Platform Users" value={company.users ?? 0} icon={Users} />
        <StatCard label="Revenue (all-time)" value={formatCurrency(company.revenue?.allTime ?? 0)} icon={TrendingUp} variant="green" />
        <StatCard label="Revenue (30 days)" value={formatCurrency(company.revenue?.last30Days ?? 0)} icon={DollarSign} variant="green" />
      </MetricGrid>

      {/* One section per ACTIVE business line — never a single line's shape
          presented as if it were the whole system. */}
      {lineNames.map((name) => {
        const lineData = lines[name];
        if (!lineData) return null;
        const renderer = LINE_RENDERERS[name];
        return (
          <div key={name}>
            {renderer ? renderer(lineData) : <GenericLineSection name={name} data={lineData} />}
          </div>
        );
      })}

      {lineNames.length === 0 && (
        <div className="dash-card text-sm text-muted-foreground">
          No business line has data yet — once you add estates, meters, or another business, it shows up here.
        </div>
      )}

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

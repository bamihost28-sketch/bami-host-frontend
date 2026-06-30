import { useParams } from 'react-router-dom';
import { BASE_API_URL } from '@/services/api';
import { FileDown } from 'lucide-react';
import { useGetTenantQuery, useGetTenantBillingQuery } from '@/services/estatesApi';
import { SkillContextPanel } from '@/components/skills/SkillContextPanel';
import { TenantDetailSkeleton } from '@/components/ui/skeletons';
import { TenantDetailHeader } from './tenant-detail/TenantDetailHeader';
import { TenantOverviewCard } from './tenant-detail/TenantOverviewCard';
import { FinancialSummaryCards } from './tenant-detail/FinancialSummaryCards';
import { AdditionalInfoRow } from './tenant-detail/AdditionalInfoRow';
import { PricingInfoRow } from './tenant-detail/PricingInfoRow';
import { PropertyMediaCard } from './tenant-detail/PropertyMediaCard';
import { ConditionReportsCard } from './tenant-detail/ConditionReportsCard';
import { TenancyHistoryCard } from './tenant-detail/TenancyHistoryCard';
import { TransactionsCard } from './tenant-detail/TransactionsCard';

export const TenantDetailPage = () => {
  const { tenantId } = useParams();
  const { data: detail, isLoading } = useGetTenantQuery(
    tenantId ? { id: tenantId as string, expand: 'history,transactions' } : ('' as unknown as { id: string }),
    { skip: !tenantId }
  );
  const { data: billingData } = useGetTenantBillingQuery(tenantId as string, { skip: !tenantId });

  const tenant = detail?.data?.tenant;
  const overview = detail?.data?.overview;
  const unitId = (tenant as any)?.unit?._id ?? (tenant as any)?.unit?.id ?? tenant?.unitId;

  // Map history from API response structure to frontend format
  const history = (((detail?.data as any)?.history) || []).map((h: any) => ({
    id: h.createdAt || String(Math.random()),
    date: h.createdAt,
    action: h.event || 'Unknown',
    notes: h.note || ''
  }));

  const historyLoading = isLoading && history.length === 0;

  // Show full page skeleton while main data is loading
  if (isLoading && !tenant) {
    return <TenantDetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <TenantDetailHeader tenantId={tenantId} tenant={tenant} overview={overview} />

      {/* Tenant Overview Card */}
      <TenantOverviewCard overview={overview} tenant={tenant} />

      {/* Pricing Info Row */}
      <PricingInfoRow overview={overview} tenant={tenant} />

      {/* Financial Summary Cards */}
      <FinancialSummaryCards overview={overview} tenant={tenant} detail={detail} />

      {/* Additional Information Row */}
      <AdditionalInfoRow tenant={tenant} overview={overview} />

      {/* Property Media Card — listing media (marketing) */}
      <PropertyMediaCard unitId={unitId} history={history} />

      {/* Condition Reports — physical inspection snapshots */}
      <ConditionReportsCard unitId={unitId} tenantId={tenantId} />

      {/* Tenancy History Card */}
      <TenancyHistoryCard history={history} isLoading={historyLoading} />

      {/* Transactions Card */}
      <TransactionsCard
        tenantId={tenantId}
        overview={overview}
        tenant={tenant}
        billingData={billingData}
      />

      {/* PDF Statement Download */}
      {tenantId && (
        <div className="flex justify-end">
          <a
            href={`${BASE_API_URL}/api/tenants/${tenantId}/statement.pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
          >
            <FileDown className="h-4 w-4" />
            Download Statement (PDF)
          </a>
        </div>
      )}

      {/* Business Skills — contextual AI panels based on tenant status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Finance AI: always show for overdue or near-due tenants */}
        {((overview as any)?.status === "overdue" || (overview as any)?.totalOutstanding > 0) && (
          <SkillContextPanel
            skill="finance"
            event="tenant_overdue"
            context={{
              tenant_name: (tenant as any)?.name ?? "this tenant",
              outstanding: (overview as any)?.totalOutstanding ?? 0,
              status: (overview as any)?.status ?? "overdue",
            }}
            title="Finance AI — Arrears Strategy"
            defaultPrompt="How do I recover this outstanding amount?"
          />
        )}
        {/* Sales AI: if tenant was from an enquiry, show sales insight */}
        <SkillContextPanel
          skill="sales"
          event="new_tenant"
          context={{
            tenant_name: (tenant as any)?.name ?? "this tenant",
            unit: (tenant as any)?.unitLabel ?? "",
          }}
          title="Sales AI — Tenant Relationship"
          defaultPrompt="How do I ensure this tenant renews their lease?"
          collapsed
        />
      </div>
    </div>
  );
};

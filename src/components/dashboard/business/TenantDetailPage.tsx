import { useParams } from 'react-router-dom';
import { useGetTenantQuery, useGetTenantBillingQuery } from '@/services/estatesApi';
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
    </div>
  );
};

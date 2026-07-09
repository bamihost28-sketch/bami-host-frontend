import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_API_URL } from '@/services/api';
import { FileDown } from 'lucide-react';
import { useGetTenantQuery, useGetTenantBillingQuery } from '@/services/estatesApi';
import { SkillContextPanel } from '@/components/skills/SkillContextPanel';
import { TenantDetailSkeleton } from '@/components/ui/skeletons';
import { GuidedTour, type TourStep } from '@/components/ui/guided-tour';
import { TenantDetailHeader } from './tenant-detail/TenantDetailHeader';
import { TenantOverviewCard } from './tenant-detail/TenantOverviewCard';
import { FinancialSummaryCards } from './tenant-detail/FinancialSummaryCards';
import { AdditionalInfoRow } from './tenant-detail/AdditionalInfoRow';
import { PricingInfoRow } from './tenant-detail/PricingInfoRow';
import { PropertyMediaCard } from './tenant-detail/PropertyMediaCard';
import { ConditionReportsCard } from './tenant-detail/ConditionReportsCard';
import { TenancyHistoryCard } from './tenant-detail/TenancyHistoryCard';
import { TransactionsCard } from './tenant-detail/TransactionsCard';

const TENANT_DETAIL_TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="tenant-header"]',
    title: 'Manage this tenant',
    content: 'Edit their details or fees, and resend their login credentials to the email on file — all from here.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="tenant-overview"]',
    title: 'Tenant profile',
    content: "The tenant's contact details, their unit, lease dates and current status at a glance.",
    placement: 'bottom',
  },
  {
    selector: '[data-tour="tenant-financial"]',
    title: 'Financial summary',
    content: 'Total paid, outstanding balances and a breakdown of rent, service charge and one-time fees.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="tenant-history"]',
    title: 'Tenancy history',
    content: 'A timeline of everything that has happened on this tenancy — payments, edits and notes.',
    placement: 'top',
  },
  {
    selector: '[data-tour="tenant-statement"]',
    title: 'Download a statement',
    content: 'Export a PDF payment statement for this tenant — handy for receipts and record-keeping.',
    placement: 'top',
  },
];

export const TenantDetailPage = () => {
  const { tenantId } = useParams();
  const [tourSignal, setTourSignal] = useState(0);
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
      <div data-tour="tenant-header">
        <TenantDetailHeader
          tenantId={tenantId}
          tenant={tenant}
          overview={overview}
          onStartTour={() => setTourSignal((n) => n + 1)}
        />
      </div>

      {/* Tenant Overview Card */}
      <div data-tour="tenant-overview">
        <TenantOverviewCard overview={overview} tenant={tenant} />
      </div>

      {/* Pricing Info Row */}
      <PricingInfoRow overview={overview} tenant={tenant} />

      {/* Financial Summary Cards */}
      <div data-tour="tenant-financial">
        <FinancialSummaryCards overview={overview} tenant={tenant} detail={detail} />
      </div>

      {/* Additional Information Row */}
      <AdditionalInfoRow tenant={tenant} overview={overview} />

      {/* Property Media Card — listing media (marketing) */}
      <PropertyMediaCard unitId={unitId} history={history} />

      {/* Condition Reports — physical inspection snapshots */}
      <ConditionReportsCard unitId={unitId} tenantId={tenantId} />

      {/* Tenancy History Card */}
      <div data-tour="tenant-history">
        <TenancyHistoryCard history={history} isLoading={historyLoading} />
      </div>

      {/* Transactions Card */}
      <TransactionsCard
        tenantId={tenantId}
        overview={overview}
        tenant={tenant}
        billingData={billingData}
      />

      {/* PDF Statement Download */}
      {tenantId && (
        <div className="flex justify-end" data-tour="tenant-statement">
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

      {/* Guided tour — auto-runs once, replayable via "Take a tour" */}
      <GuidedTour steps={TENANT_DETAIL_TOUR_STEPS} storageKey="tour:tenant-detail:v1" startSignal={tourSignal} />
    </div>
  );
};

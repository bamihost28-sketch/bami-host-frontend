import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComplaintSubmission } from '@/components/ui/ComplaintSubmission';

interface TenantOverviewCardProps {
  overview: any;
  tenant: any;
}

export const TenantOverviewCard = ({ overview, tenant }: TenantOverviewCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 text-white">
            <CardTitle className="flex items-center gap-3 mb-2 text-2xl">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                {(overview?.name || tenant?.tenantName || '')?.charAt(0)?.toUpperCase() || 'T'}
              </div>
              <div>
                <div>{overview?.name || tenant?.tenantName || 'Unknown Tenant'}</div>
                {(overview?.unit || tenant?.unitLabel) && (
                  <div className="text-sm font-normal text-blue-100 mt-1">
                    Unit: {overview?.unit || tenant?.unitLabel}
                  </div>
                )}
              </div>
            </CardTitle>
            <div className="flex gap-2 mt-3">
              {(overview?.typeBadge || tenant?.tenantType) && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  {overview?.typeBadge || tenant?.tenantType}
                </Badge>
              )}
              <Badge 
                className={
                  overview?.status === 'occupied' || tenant?.status === 'occupied'
                    ? "bg-emerald-500/80 text-white hover:bg-emerald-600"
                    : "bg-amber-500/80 text-white hover:bg-amber-600"
                }
              >
                {overview?.status || tenant?.status || 'Unknown'}
              </Badge>
            </div>
          </div>
          <ComplaintSubmission onSubmit={(complaint: any) => {
            console.log('Complaint submitted:', complaint);
          }} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
          <div>
            <div className="text-blue-100 text-xs uppercase tracking-wider mb-1">Email</div>
            <div className="font-medium">{tenant?.email || overview?.email || tenant?.tenantEmail || '—'}</div>
          </div>
          <div>
            <div className="text-blue-100 text-xs uppercase tracking-wider mb-1">Phone</div>
            <div className="font-medium">{tenant?.whatsapp || tenant?.whatsappNumber || overview?.phone || tenant?.tenantPhone || '—'}</div>
          </div>
          <div>
            <div className="text-blue-100 text-xs uppercase tracking-wider mb-1">Electric Meter</div>
            <div className="font-medium font-mono">{overview?.meter || tenant?.electricMeterNumber || '—'}</div>
          </div>
        </div>
        {((tenant?.rentOutstanding ?? 0) + (tenant?.serviceChargeOutstanding ?? 0)) > 0 && (
          <div className="mt-4 rounded-md bg-red-500/20 border border-red-400/40 px-3 py-2">
            <div className="text-xs text-red-100 uppercase tracking-wider font-semibold mb-1">Outstanding Balance</div>
            <div className="flex flex-wrap gap-4 text-sm text-white">
              {(tenant?.rentOutstanding ?? 0) > 0 && (
                <span>Rent: <strong>₦{(tenant.rentOutstanding).toLocaleString()}</strong></span>
              )}
              {(tenant?.serviceChargeOutstanding ?? 0) > 0 && (
                <span>Service charge: <strong>₦{(tenant.serviceChargeOutstanding).toLocaleString()}</strong></span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

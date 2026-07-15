import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil } from 'lucide-react';
import { formatDate } from '@/utils/propertyUtils';
import { usePermissions } from '@/hooks/usePermissions';
import { useAdjustTenantBalanceMutation } from '@/services/estatesApi';
import { toast } from '@/components/ui/use-toast';

interface FinancialSummaryCardsProps {
  overview: any;
  tenant: any;
  detail: any;
  tenantId?: string;
}

export const FinancialSummaryCards = ({ overview, tenant, detail, tenantId }: FinancialSummaryCardsProps) => {
  const totalMonthlyCommitment = (overview?.rent || 0) + (overview?.serviceCharge || 0);
  const year1 = (overview as any)?.yearlyBreakdown?.year1;
  const year2 = (overview as any)?.yearlyBreakdown?.year2;

  const { isOwner } = usePermissions();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [rentInput, setRentInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [reason, setReason] = useState('');
  const [adjustBalance, { isLoading: adjusting }] = useAdjustTenantBalanceMutation();

  const openAdjust = () => {
    setRentInput(String((overview as any)?.rentOutstanding ?? 0));
    setServiceInput(String((overview as any)?.serviceChargeOutstanding ?? 0));
    setReason('');
    setAdjustOpen(true);
  };

  const submitAdjust = async () => {
    if (!tenantId) return;
    try {
      const res = await adjustBalance({
        tenantId,
        rentOutstanding: Number(rentInput) || 0,
        serviceChargeOutstanding: Number(serviceInput) || 0,
        reason: reason || undefined,
      }).unwrap();
      toast({ title: res?.message || 'Outstanding balance updated' });
      setAdjustOpen(false);
    } catch (e: any) {
      toast({ title: e?.data?.detail || 'Failed to update balance', variant: 'destructive' });
    }
  };

  const clearBalance = async () => {
    if (!tenantId) return;
    if (!confirm("Clear this tenant's entire outstanding balance to ₦0? This cannot be undone.")) return;
    try {
      const res = await adjustBalance({ tenantId, clear: true, reason: reason || undefined }).unwrap();
      toast({ title: res?.message || 'Outstanding balance cleared' });
      setAdjustOpen(false);
    } catch (e: any) {
      toast({ title: e?.data?.detail || 'Failed to clear balance', variant: 'destructive' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Rent</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  ₦{typeof overview?.rent === 'number' ? overview.rent.toLocaleString() : (typeof tenant?.rentAmount === 'number' ? tenant.rentAmount.toLocaleString() : '0')}
                </p>
                {overview?.rentIncreased ? (
                  <Badge variant="outline" className="text-[9px] bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 py-0 h-4">
                    Increased
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 py-0 h-4">
                    Standard
                  </Badge>
                )}
              </div>
              {overview?.rentIncreased && overview?.storedRent && (
                <p className="text-[9px] text-slate-400 line-through mt-1">Was ₦{overview.storedRent.toLocaleString()}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Service Charge</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  ₦{typeof overview?.serviceCharge === 'number' ? overview.serviceCharge.toLocaleString() : (typeof overview?.serviceChargeMonthly === 'number' ? overview.serviceChargeMonthly.toLocaleString() : '0')}
                </p>
                {overview?.serviceChargeIncreased ? (
                  <Badge variant="outline" className="text-[9px] bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 py-0 h-4">
                    Increased
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 py-0 h-4">
                    Standard
                  </Badge>
                )}
              </div>
              {overview?.serviceChargeIncreased && overview?.storedServiceCharge && (
                <p className="text-[9px] text-slate-400 line-through mt-1">Was ₦{overview.storedServiceCharge.toLocaleString()}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {(() => {
        const nextDue = (overview as any)?.nextDue || tenant?.nextDueDate;
        const arrearsMonths: number = (overview as any)?.arrearsMonths ?? 0;
        const isOverdue = nextDue && new Date(nextDue) < new Date() && arrearsMonths > 0;
        return (
          <Card className={`bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow border-l-4 ${isOverdue ? 'border-l-red-500 border-red-200 dark:border-red-800' : 'border-l-amber-500 border-slate-200 dark:border-slate-800'}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isOverdue ? 'Overdue Since' : 'Next Due Date'}
                  </p>
                  <p className={`text-lg font-bold mt-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                    {formatDate(nextDue)}
                  </p>
                  {isOverdue && (
                    <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-0.5">
                      {arrearsMonths} month{arrearsMonths !== 1 ? 's' : ''} overdue
                    </p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  <svg className={`w-5 h-5 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-black border-0 shadow-lg">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Monthly</p>
              <p className="text-2xl font-black text-white mt-1">
                ₦{totalMonthlyCommitment.toLocaleString()}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">Rent + Service</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Paid</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                ₦{detail?.data?.financialSummary?.totalPaid?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                {detail?.data?.financialSummary?.totalPayments || 0} txns
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {detail?.data?.financialSummary?.pendingPayments || 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Outstanding</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {((overview as any)?.hasOutstanding || isOwner) && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-red-500 dark:text-red-400 uppercase tracking-wider">Outstanding Balance</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-300 mt-1">
                  ₦{((overview as any)?.totalOutstanding ?? 0).toLocaleString()}
                </p>
                <div className="text-xs text-red-500 dark:text-red-400 mt-0.5 space-y-0.5">
                  {(overview as any)?.rentOutstanding > 0 && (
                    <div>Rent: ₦{(overview as any).rentOutstanding.toLocaleString()}</div>
                  )}
                  {(overview as any)?.serviceChargeOutstanding > 0 && (
                    <div>Service: ₦{(overview as any).serviceChargeOutstanding.toLocaleString()}</div>
                  )}
                  {!(overview as any)?.hasOutstanding && (
                    <div className="text-slate-400 dark:text-slate-500">No outstanding balance</div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                {isOwner && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40" onClick={openAdjust}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Adjust
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isOwner && (
        <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update outstanding balance</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="adj-rent">Rent outstanding (₦)</Label>
                <Input id="adj-rent" type="number" min={0} value={rentInput} onChange={(e) => setRentInput(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adj-service">Service charge outstanding (₦)</Label>
                <Input id="adj-service" type="number" min={0} value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adj-reason">Reason (optional, kept on record)</Label>
                <Input id="adj-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. waived after part-cash payment" />
              </div>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Sets the balance to these exact amounts. This change is logged to the tenant's history.
              </p>
            </div>
            <div className="flex justify-between gap-2 mt-2">
              <Button variant="outline" onClick={clearBalance} disabled={adjusting} className="text-red-600 border-red-200 hover:bg-red-50">
                Clear to ₦0
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setAdjustOpen(false)}>Cancel</Button>
                <Button onClick={submitAdjust} disabled={adjusting}>
                  {adjusting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {year1 && (
        <Card className="bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-900 border-0 shadow-lg">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-teal-100 uppercase tracking-wider">{year1.label ?? 'Year 1'}</p>
                  <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">Year 1</span>
                </div>
                <p className="text-2xl font-black text-white">₦{(year1.total ?? 0).toLocaleString()}</p>
                <p className="text-[9px] text-teal-100 mt-1">
                  ₦{(year1.annualRent ?? 0).toLocaleString()} rent · ₦{(year1.annualServiceCharge ?? 0).toLocaleString()} service
                  {year1.oneTimeFees > 0 && ` · ₦${year1.oneTimeFees.toLocaleString()} fees`}
                </p>
                <p className="text-[9px] text-teal-200 mt-0.5">
                  {formatDate(year1.billingStart)} – {formatDate(year1.billingEnd)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm ml-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {year2 && (
        <Card className="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-950 border-0 shadow-lg">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">{year2.label ?? 'Year 2'}</p>
                  <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">Year 2</span>
                  {year2.rentIncreased && (
                    <span className="text-[9px] bg-rose-500/70 text-white px-1.5 py-0.5 rounded-full">Rent ↑</span>
                  )}
                </div>
                <p className="text-2xl font-black text-white">₦{(year2.total ?? 0).toLocaleString()}</p>
                <p className="text-[9px] text-slate-300 mt-1">
                  ₦{(year2.annualRent ?? 0).toLocaleString()} rent · ₦{(year2.annualServiceCharge ?? 0).toLocaleString()} service
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  {formatDate(year2.billingStart)} – {formatDate(year2.billingEnd)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm ml-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


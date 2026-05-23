import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/propertyUtils';

interface FinancialSummaryCardsProps {
  overview: any;
  tenant: any;
  detail: any;
}

export const FinancialSummaryCards = ({ overview, tenant, detail }: FinancialSummaryCardsProps) => {
  const totalMonthlyCommitment = (overview?.rent || 0) + (overview?.serviceCharge || 0);
  const year1 = (overview as any)?.yearlyBreakdown?.year1;
  const year2 = (overview as any)?.yearlyBreakdown?.year2;

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

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Next Due Date</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {formatDate((overview as any)?.nextDue || tenant?.nextDueDate)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

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


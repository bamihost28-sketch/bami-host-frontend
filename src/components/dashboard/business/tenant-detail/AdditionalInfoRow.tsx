import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/propertyUtils';

interface AdditionalInfoRowProps {
  tenant: any;
  overview?: any;
}

export const AdditionalInfoRow = ({ tenant, overview }: AdditionalInfoRowProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Move-in Date</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatDate(tenant?.entryDate || tenant?.createdAt)}
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Entry Date</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estate</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {tenant?.estate?.name || 'N/A'}
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Property</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lease Info</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {tenant?.entryDate && (overview?.nextDue || tenant?.nextDueDate)
                  ? `${Math.ceil((new Date(overview?.nextDue || tenant.nextDueDate).getTime() - new Date(tenant.entryDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months`
                  : 'Ongoing'
                }
              </p>
              <div className="flex flex-col text-[8px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                <span>Entry: {formatDate(tenant?.entryDate)}</span>
                <span>Next Due: {formatDate(overview?.nextDue || tenant?.nextDueDate)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-l-4 border-l-cyan-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lease Duration</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {overview?.leaseDurationMonths || 0}
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">months</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

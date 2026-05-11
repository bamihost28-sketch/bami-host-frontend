import { Building, Key, Calendar, DollarSign, Zap, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "./utils";

interface TenantInfo {
  apartmentNumber: string;
  estateName: string;
  leaseStartDate: string;
  leaseStatus: string;
  nextPaymentDue: string;
  name: string;
  meterNumber?: string;
}

interface YearlyPayment {
  currentYear: { year: number; isFirstTime: boolean; totalPaid: number };
  nextYear: { year: number; projectedTotal: number; renewalStartDate: string };
}

interface OverviewCardsProps {
  tenantInfo: TenantInfo;
  daysUntilRentDue: number;
  totalDue: number;
  recurringCount: number;
  yearlyPayment?: YearlyPayment;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  tenantInfo,
  daysUntilRentDue,
  totalDue,
  recurringCount,
  yearlyPayment,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
          <Building className="h-4 w-4" />
          <span className="text-sm">Apartment</span>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{tenantInfo.apartmentNumber}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{tenantInfo.estateName}</p>
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
          <Key className="h-4 w-4" />
          <span className="text-sm">Lease Start</span>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatDate(tenantInfo.leaseStartDate)}</p>
        <p className="text-sm text-green-600 dark:text-green-400">{tenantInfo.leaseStatus}</p>
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Next Due</span>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatDate(tenantInfo.nextPaymentDue)}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{daysUntilRentDue} days</p>
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
          <DollarSign className="h-4 w-4" />
          <span className="text-sm">Total Due</span>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(totalDue)}</p>
        <p className="text-sm text-green-600 dark:text-green-400">{recurringCount} recurring</p>
      </div>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
          <Zap className="h-4 w-4" />
          <span className="text-sm">Meter No.</span>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {tenantInfo.meterNumber || "Not assigned"}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">Electricity</p>
      </div>

      {yearlyPayment && (
        <>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">{yearlyPayment.currentYear.year} Paid</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(yearlyPayment.currentYear.totalPaid)}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {yearlyPayment.currentYear.isFirstTime ? "First payment" : "This year"}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{yearlyPayment.nextYear.year} Due</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(yearlyPayment.nextYear.projectedTotal)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {formatDate(yearlyPayment.nextYear.renewalStartDate)}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

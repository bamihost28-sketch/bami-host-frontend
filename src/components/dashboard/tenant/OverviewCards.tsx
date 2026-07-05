import { Building, Key, Calendar, Zap, LogIn, Clock } from "lucide-react";
import { formatDate } from "./utils";

interface TenantInfo {
  apartmentNumber: string;
  estateName: string;
  leaseStartDate: string;
  leaseStatus: string;
  nextPaymentDue: string;
  name: string;
  meterNumber?: string;
}

interface OverviewCardsProps {
  tenantInfo: TenantInfo;
  daysUntilRentDue: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  tenantInfo,
  daysUntilRentDue,
}) => {
  const isOverdue = daysUntilRentDue < 0;
  const overdueMonths = isOverdue ? Math.floor(Math.abs(daysUntilRentDue) / 30) : 0;

  // Move-in = start of the CURRENT lease period: the last entry-date anniversary
  // strictly BEFORE the next due date (keeps the entry's day & month, e.g. entry
  // 1 Jun 2024 + next due 30 May 2026 -> 1 Jun 2025). Strict <: a due date
  // exactly on the anniversary is the END of the period that started a year
  // earlier (entry 9 Dec 2025 + due 9 Dec 2026 -> 9 Dec 2025). Falls back to
  // (next due - 1yr) only when there's no entry date.
  const moveInDate = (() => {
    const entry = tenantInfo.leaseStartDate ? new Date(tenantInfo.leaseStartDate) : null;
    const due = tenantInfo.nextPaymentDue ? new Date(tenantInfo.nextPaymentDue) : null;
    if (entry && !isNaN(entry.getTime())) {
      if (due && !isNaN(due.getTime())) {
        while (true) {
          const nextAnniv = new Date(entry);
          nextAnniv.setFullYear(nextAnniv.getFullYear() + 1);
          if (nextAnniv < due) entry.setFullYear(entry.getFullYear() + 1);
          else break;
        }
      }
      return entry;
    }
    if (due && !isNaN(due.getTime())) {
      due.setFullYear(due.getFullYear() - 1);
      due.setDate(due.getDate() - 1);
      return due;
    }
    return null;
  })();

  const leaseStartYear = new Date(tenantInfo.leaseStartDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const totalYears = currentYear - leaseStartYear;
  const totalStayLabel = totalYears <= 0
    ? "Less than 1 year"
    : totalYears === 1
    ? "1 Year"
    : `${totalYears} Years`;

  const statusColorClass =
    tenantInfo.leaseStatus === 'evicted'
      ? 'text-purple-600 dark:text-purple-400'
      : tenantInfo.leaseStatus === 'pending'
      ? 'text-blue-600 dark:text-blue-400'
      : tenantInfo.leaseStatus === 'occupied'
      ? 'text-green-600 dark:text-green-400'
      : 'text-slate-600 dark:text-slate-400';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border min-w-0">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
          <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="text-xs sm:text-sm truncate">Apartment</span>
        </div>
        <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{tenantInfo.apartmentNumber}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{tenantInfo.estateName}</p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border min-w-0">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
          <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="text-xs sm:text-sm truncate">Lease Start</span>
        </div>
        <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">{formatDate(tenantInfo.leaseStartDate)}</p>
        <p className={`text-xs capitalize ${statusColorClass}`}>{tenantInfo.leaseStatus}</p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border min-w-0">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
          <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="text-xs sm:text-sm truncate">Move In Date</span>
        </div>
        <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">{moveInDate ? formatDate(moveInDate.toISOString()) : '—'}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">{tenantInfo.leaseStartDate ? 'Current lease period' : '1yr before due'}</p>
      </div>

      <div className={`rounded-lg p-2.5 sm:p-3 border min-w-0 ${isOverdue ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
        <div className={`flex items-center gap-1.5 mb-1 ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="text-xs sm:text-sm truncate">{isOverdue ? 'Overdue' : 'Next Due'}</span>
        </div>
        <p className={`text-sm sm:text-base font-semibold ${isOverdue ? 'text-red-700 dark:text-red-300' : 'text-slate-900 dark:text-slate-100'}`}>
          {formatDate(tenantInfo.nextPaymentDue)}
        </p>
        {isOverdue ? (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {overdueMonths > 0 ? `${overdueMonths}mo overdue` : `${Math.abs(daysUntilRentDue)}d overdue`}
          </p>
        ) : (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {daysUntilRentDue <= 7 ? `Due in ${daysUntilRentDue}d` : `${daysUntilRentDue} days`}
          </p>
        )}
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border min-w-0">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="text-xs sm:text-sm truncate">Total Stay</span>
        </div>
        <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">{totalStayLabel}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">Since {leaseStartYear}</p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2.5 sm:p-3 border min-w-0">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-1">
          <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="text-xs sm:text-sm truncate">Meter No.</span>
        </div>
        <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
          {tenantInfo.meterNumber || "Not assigned"}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400">Electricity</p>
      </div>
    </div>
  );
};

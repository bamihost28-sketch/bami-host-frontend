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

  const moveInDate = new Date(tenantInfo.nextPaymentDue);
  moveInDate.setFullYear(moveInDate.getFullYear() - 1);
  moveInDate.setDate(moveInDate.getDate() - 1);

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
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
        <p className={`text-sm capitalize ${statusColorClass}`}>{tenantInfo.leaseStatus}</p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
          <LogIn className="h-4 w-4" />
          <span className="text-sm">Move In Date</span>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatDate(moveInDate.toISOString())}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">1 year before next due</p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Total Stay</span>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{totalStayLabel}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">Since {leaseStartYear}</p>
      </div>

      <div className={`rounded-lg p-3 border ${isOverdue ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{isOverdue ? 'Overdue Since' : 'Next Due'}</span>
        </div>
        <p className={`text-lg font-semibold ${isOverdue ? 'text-red-700 dark:text-red-300' : 'text-slate-900 dark:text-slate-100'}`}>
          {formatDate(tenantInfo.nextPaymentDue)}
        </p>
        {isOverdue ? (
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            {overdueMonths > 0 ? `${overdueMonths} month${overdueMonths !== 1 ? 's' : ''} overdue` : `${Math.abs(daysUntilRentDue)} days overdue`}
          </p>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {daysUntilRentDue <= 7 ? `Due in ${daysUntilRentDue} day${daysUntilRentDue !== 1 ? 's' : ''}` : `${daysUntilRentDue} days`}
          </p>
        )}
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
    </div>
  );
};

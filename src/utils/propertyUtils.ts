import type { ConditionReportType, ConditionRating } from '@/services/estatesApi';

export const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Wi-Fi',
  pool: 'Pool',
  gym: 'Gym',
  parking: 'Parking',
  ac: 'A/C',
  security: 'Security',
  petFriendly: 'Pet Friendly',
  balcony: 'Balcony',
  laundry: 'Laundry',
};

export const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  initiated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

export const TYPE_LABELS: Record<ConditionReportType, string> = {
  move_in: 'Move-in',
  move_out: 'Move-out',
  routine: 'Routine',
  maintenance: 'Maintenance',
  pre_listing: 'Pre-listing',
};

export const TYPE_COLORS: Record<ConditionReportType, string> = {
  move_in: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  move_out: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  routine: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  pre_listing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

export const CONDITION_COLORS: Record<ConditionRating, string> = {
  excellent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  good: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

/** "27 may, 2026" — long format used across tenant detail views */
export const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

/** "27 May 2026" — short en-GB format used in media/condition cards */
export const formatDateShort = (iso?: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** "DD/MM/YYYY" — for API date inputs.
 *  Reads the calendar date directly from an ISO/`YYYY-MM-DD` string so a
 *  date never shifts a day across time zones (e.g. WAT / UTC+1). */
export const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  const iso = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/** Convert any stored date value to the `YYYY-MM-DD` a <input type="date">
 *  expects, WITHOUT time-zone math. Grabbing the date part of an ISO string
 *  directly avoids the UTC round-trip that shifts the day in WAT (UTC+1). */
export const toDateInput = (value?: string | null): string => {
  if (!value) return '';
  const iso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatCurrency = (n: number): string =>
  '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });

/** "27 May 2026" — en-NG short format used in dashboard views */
export const formatDateNg = (value?: string | null): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
};

/** Intl-based currency — "₦25,000" using NGN locale */
export const formatCurrencyIntl = (amount: number): string =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
    case 'approved':
    case 'paid':
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'pending':
    case 'in_progress':
    case 'assigned':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'overdue':
    case 'rejected':
    case 'expired':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'expiring_soon':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

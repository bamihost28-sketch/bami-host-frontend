/** Two-currency money helpers for platform costs (most are paid in dollars, some in naira). */

export type Currency = 'USD' | 'NGN';

/** Display order: most of the platform's bills are in dollars. */
export const CURRENCY_ORDER: Currency[] = ['USD', 'NGN'];

export const CURRENCY_LABEL: Record<Currency, string> = {
  USD: 'US Dollar ($)',
  NGN: 'Naira (₦)',
};

export const CURRENCY_SYMBOL: Record<Currency, string> = { USD: '$', NGN: '₦' };

export type CurrencyTotals = Partial<Record<Currency, number>>;

/** Exact amount in its own currency: dollars always show cents; naira shows kobo only when there is some. */
export const formatMoney = (amount: number, currency: Currency = 'NGN'): string => {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  const hasKobo = Math.abs(amount % 1) > 0;
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: hasKobo ? 2 : 0, maximumFractionDigits: 2 })}`;
};

/** Per-currency totals, e.g. "$47.49 + ₦9,800". Currencies are never added together. */
export const formatTotals = (totals?: CurrencyTotals | null): string => {
  const parts = CURRENCY_ORDER.filter((c) => (totals?.[c] ?? 0) !== 0).map((c) => formatMoney(totals![c]!, c));
  return parts.length ? parts.join(' + ') : '—';
};

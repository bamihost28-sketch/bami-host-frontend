import type { BlockType } from '@/services/billionaireApi';

/** Local YYYY-MM-DD (avoids UTC off-by-one near midnight). */
export const localDate = (d: Date = new Date()): string => {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
};

export const prettyDate = (iso: string): string =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });

/** Convert a 24-hour "HH:MM" value to a 12-hour label ("4:30 AM").
 *  Passes through values that already include AM/PM (legacy data). */
export const to12h = (t?: string | null): string => {
  if (!t) return '';
  if (/[ap]m/i.test(t)) return t;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return t;
  let h = parseInt(m[1], 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m[2]} ${ampm}`;
};

export const BLOCK_TYPES: BlockType[] = ['signal', 'noise', 'reminder', 'neutral'];

export const BLOCK_STYLES: Record<BlockType, { label: string; chip: string; dot: string; row: string }> = {
  signal:   { label: 'Signal',   chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', row: 'border-l-emerald-500' },
  noise:    { label: 'Noise',    chip: 'bg-red-100 text-red-700 border-red-200',             dot: 'bg-red-500',     row: 'border-l-red-500' },
  reminder: { label: 'Reminder', chip: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500',    row: 'border-l-blue-500' },
  neutral:  { label: 'Neutral',  chip: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-400',   row: 'border-l-slate-300' },
};

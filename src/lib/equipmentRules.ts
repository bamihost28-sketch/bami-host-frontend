// Booking rules for rental equipment (excavators first).
//
//  - A customer can book from TOMORROW onward, never today or earlier.
//  - Every booking is followed (and preceded) by a 1-week turnaround break: the machine is
//    returned/moved and serviced before the next customer. The break is 7 clear days, so
//    a booking that ends on the 5th blocks the machine until the 12th inclusive.

export const TURNAROUND_DAYS = 7;
export const AVAILABILITY_HORIZON_DAYS = 120;

export interface BookingRange {
  id?: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD inclusive
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
}

export interface FreeWindow {
  start: string;
  /** null = open ended (free beyond the planning horizon). */
  end: string | null;
}

const pad = (n: number) => String(n).padStart(2, "0");

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const addDays = (iso: string, n: number): string => {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
};

export const daysBetweenInclusive = (start: string, end: string): number => {
  const [y1, m1, d1] = start.split("-").map(Number);
  const [y2, m2, d2] = end.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000) + 1;
};

export const today = (now: Date = new Date()) => toISO(now);
export const earliestBookableStart = (now: Date = new Date()) => addDays(today(now), 1);

const live = <T extends BookingRange>(bookings: T[]): T[] => bookings.filter((b) => b.status !== "cancelled");

/** The first booking (if any) that the proposed dates run into, including the 1-week break. */
export const findConflict = <T extends BookingRange>(bookings: T[], start: string, end: string): T | undefined =>
  live(bookings).find(
    (b) => start <= addDays(b.end, TURNAROUND_DAYS) && end >= addDays(b.start, -TURNAROUND_DAYS)
  );

export type BookingCheck = { ok: true } | { ok: false; reason: string };

export const validateBooking = (
  bookings: BookingRange[],
  start: string,
  end: string,
  now: Date = new Date()
): BookingCheck => {
  if (!start || !end) return { ok: false, reason: "Choose a start and an end date." };
  if (end < start) return { ok: false, reason: "The end date is before the start date." };
  const earliest = earliestBookableStart(now);
  if (start < earliest) return { ok: false, reason: `Bookings start from tomorrow (${earliest}) at the earliest.` };
  const clash = findConflict(bookings, start, end);
  if (clash) {
    return {
      ok: false,
      reason: `Clashes with another booking (${clash.start} to ${clash.end}). Each booking needs a ${TURNAROUND_DAYS}-day break before and after for servicing and delivery.`,
    };
  }
  return { ok: true };
};

/** Date ranges a customer may book, from tomorrow to the end of the planning horizon. */
export const availabilityWindows = (
  bookings: BookingRange[],
  now: Date = new Date(),
  horizonDays: number = AVAILABILITY_HORIZON_DAYS
): FreeWindow[] => {
  const from = earliestBookableStart(now);
  const horizonEnd = addDays(today(now), horizonDays);

  const blocked = live(bookings)
    .map((b) => ({ start: addDays(b.start, -TURNAROUND_DAYS), end: addDays(b.end, TURNAROUND_DAYS) }))
    .sort((a, b) => a.start.localeCompare(b.start));

  const windows: FreeWindow[] = [];
  let cursor = from;
  for (const blk of blocked) {
    if (blk.end < cursor) continue;
    if (blk.start > cursor) windows.push({ start: cursor, end: addDays(blk.start, -1) });
    cursor = addDays(blk.end, 1);
  }
  if (cursor <= horizonEnd) windows.push({ start: cursor, end: null });
  return windows;
};

export interface Quote {
  days: number;
  machine: number;
  operator: number;
  mobilisation: number;
  total: number;
}

export const quoteBooking = (
  rates: { dailyRate: number; operatorRate: number; mobilisationFee: number },
  start: string,
  end: string,
  withOperator: boolean
): Quote | null => {
  if (!start || !end || end < start) return null;
  const days = daysBetweenInclusive(start, end);
  const machine = rates.dailyRate * days;
  const operator = withOperator ? rates.operatorRate * days : 0;
  return { days, machine, operator, mobilisation: rates.mobilisationFee, total: machine + operator + rates.mobilisationFee };
};

/** Operator's pre-start checks, to be done before work begins each day. */
export const PRE_START_CHECKS = [
  { key: "water", label: "Water", hint: "Check the water (radiator / coolant) level and top up if low." },
  { key: "oil", label: "Engine oil", hint: "Pull the dipstick and gauge the oil level." },
  { key: "general", label: "General walk-round", hint: "Check hydraulics for leaks, tracks, bucket, teeth, lights and cab." },
] as const;

export type PreStartKey = (typeof PRE_START_CHECKS)[number]["key"];

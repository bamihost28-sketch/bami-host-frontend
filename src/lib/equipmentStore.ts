import { useSyncExternalStore } from "react";
import {
  EXCAVATOR_BOOKINGS,
  EXCAVATOR_LOGS,
  type ExcavatorBooking,
  type ExcavatorLog,
} from "@/data/excavatorData";
import { PRE_START_CHECKS, type PreStartKey } from "@/lib/equipmentRules";

// Shared demo state so the customer, operator and owner screens see the same bookings and shifts.
// Kept in memory and mirrored to localStorage. Replace with an API slice when the backend exists.

export interface ShiftBreak {
  start: string; // ISO timestamp
  end?: string;
}

export interface Shift {
  id: string;
  assetId: string;
  operator: string;
  site: string;
  date: string; // YYYY-MM-DD
  checks: Partial<Record<PreStartKey, boolean>>;
  checkNotes: string;
  checksDoneAt?: string;
  startedAt?: string;
  breaks: ShiftBreak[];
  finishedAt?: string;
  hoursWorked?: number;
  fuelLitres?: number;
}

interface State {
  bookings: (ExcavatorBooking & { customer?: string })[];
  logs: ExcavatorLog[];
  shifts: Shift[];
}

const KEY = "bh-equipment-demo-v1";

const seed = (): State => ({
  bookings: EXCAVATOR_BOOKINGS.map((b) => ({ ...b })),
  logs: EXCAVATOR_LOGS.map((l) => ({ ...l })),
  shifts: [],
});

const load = (): State => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed && Array.isArray(parsed.bookings) && Array.isArray(parsed.logs) && Array.isArray(parsed.shifts)) return parsed;
    }
  } catch {
    /* storage unavailable or corrupt: fall back to seed data */
  }
  return seed();
};

let state: State = load();
const listeners = new Set<() => void>();

const commit = (next: State) => {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useEquipmentStore = () => useSyncExternalStore(subscribe, () => state, () => state);

export const resetEquipmentDemo = () => commit(seed());

const nowISO = () => new Date().toISOString();

// ── Bookings ────────────────────────────────────────────────────
export const addBooking = (b: Omit<ExcavatorBooking, "id" | "status"> & { customer?: string }) =>
  commit({ ...state, bookings: [...state.bookings, { ...b, id: `bk_${Date.now()}`, status: "confirmed" }] });

export const cancelBooking = (id: string) =>
  commit({ ...state, bookings: state.bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)) });

// ── Manual logs (owner) ─────────────────────────────────────────
export const addLog = (l: Omit<ExcavatorLog, "id">) =>
  commit({ ...state, logs: [{ ...l, id: `lg_${Date.now()}` }, ...state.logs] });

// ── Operator shifts ─────────────────────────────────────────────
/** The shift still open (not finished) for a machine, if any. */
export const openShiftFor = (s: State, assetId: string) =>
  s.shifts.find((x) => x.assetId === assetId && !x.finishedAt);

const patchShift = (id: string, fn: (s: Shift) => Shift) =>
  commit({ ...state, shifts: state.shifts.map((s) => (s.id === id ? fn(s) : s)) });

export const beginShift = (assetId: string, operator: string, site: string, date: string) => {
  if (openShiftFor(state, assetId)) return;
  commit({
    ...state,
    shifts: [
      ...state.shifts,
      { id: `sh_${Date.now()}`, assetId, operator, site, date, checks: {}, checkNotes: "", breaks: [] },
    ],
  });
};

export const setCheck = (id: string, key: PreStartKey, value: boolean) =>
  patchShift(id, (s) => (s.startedAt ? s : { ...s, checks: { ...s.checks, [key]: value }, checksDoneAt: undefined }));

export const setCheckNotes = (id: string, notes: string) => patchShift(id, (s) => ({ ...s, checkNotes: notes }));

export const confirmChecks = (id: string) =>
  patchShift(id, (s) =>
    PRE_START_CHECKS.every((c) => s.checks[c.key]) ? { ...s, checksDoneAt: nowISO() } : s
  );

/** Work cannot start until every pre-start check is ticked and confirmed. */
export const startWork = (id: string) =>
  patchShift(id, (s) => (s.checksDoneAt && !s.startedAt ? { ...s, startedAt: nowISO() } : s));

export const startRest = (id: string) =>
  patchShift(id, (s) => {
    if (!s.startedAt || s.finishedAt || s.breaks.some((b) => !b.end)) return s;
    return { ...s, breaks: [...s.breaks, { start: nowISO() }] };
  });

export const endRest = (id: string) =>
  patchShift(id, (s) => ({ ...s, breaks: s.breaks.map((b) => (b.end ? b : { ...b, end: nowISO() })) }));

export const workedHours = (s: Shift, at: number = Date.now()): number => {
  if (!s.startedAt) return 0;
  const end = s.finishedAt ? new Date(s.finishedAt).getTime() : at;
  const rest = s.breaks.reduce((sum, b) => {
    const bs = new Date(b.start).getTime();
    const be = b.end ? new Date(b.end).getTime() : end;
    return sum + Math.max(0, Math.min(be, end) - bs);
  }, 0);
  return Math.max(0, end - new Date(s.startedAt).getTime() - rest) / 3_600_000;
};

/** Finish the day: closes any rest, records hours and fuel, and adds a log entry for the owner. */
export const finishWork = (id: string, fuelLitres: number) => {
  const shift = state.shifts.find((s) => s.id === id);
  if (!shift || !shift.startedAt || shift.finishedAt) return;
  const finishedAt = nowISO();
  const closed: Shift = {
    ...shift,
    breaks: shift.breaks.map((b) => (b.end ? b : { ...b, end: finishedAt })),
    finishedAt,
    fuelLitres,
  };
  const hours = Math.round(workedHours(closed) * 10) / 10;
  closed.hoursWorked = hours;
  commit({
    ...state,
    shifts: state.shifts.map((s) => (s.id === id ? closed : s)),
    logs: [
      {
        id: `shift_${id}`,
        assetId: shift.assetId,
        date: shift.date,
        operator: shift.operator,
        site: shift.site,
        hoursWorked: hours,
        fuelLitres,
        notes: shift.checkNotes || undefined,
      },
      ...state.logs,
    ],
  });
};

/** Logs beyond the seeded ones advance the hours meter. */
export const SEEDED_LOG_IDS = new Set(EXCAVATOR_LOGS.map((l) => l.id));

import { collectDateStringsBogota } from "./classify-worked-hours-v2.util";

/**
 * The transport allowance ("auxilio de transporte") is owed once per employee per
 * Bogota calendar day, regardless of how many hour records that day holds or how
 * many events they belong to. It used to be stored on every hour record and added
 * into that record's `total`, which paid it once per record.
 *
 * It now lives outside the record and is resolved here at roll-up time. Nothing in
 * this file touches Mongo, so the rule can be reasoned about on its own.
 */

export interface AllowanceRecord {
  _id?: unknown;
  eventId?: unknown;
  startTime?: Date | string | null;
  endTime?: Date | string | null;
  auxiliaryTrasport?: number | null;
}

export interface EmployeeAllowance {
  /** Days this event pays for. */
  transportDays: number;
  /** transportDays * auxPerDay. */
  transportAllowance: number;
  /**
   * Days this event owns that already carry the allowance inside a record's
   * `total` (records written before the rule changed). They are not paid again.
   */
  legacyDays: number;
}

const toDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

/** Bogota calendar days a record covers. Open records cover their start day. */
export const coveredBogotaDays = (record: AllowanceRecord): string[] => {
  const start = toDate(record.startTime);
  if (!start) return [];

  const end = toDate(record.endTime);
  if (!end || end.getTime() <= start.getTime()) {
    return collectDateStringsBogota(start, new Date(start.getTime() + 1));
  }

  return collectDateStringsBogota(start, end);
};

const recordKey = (record: AllowanceRecord): string => String(record._id ?? "");

/**
 * Decides which event pays each day when an employee works more than one event on
 * the same day: the day belongs to the event holding their earliest record that
 * day, ties broken by `_id`.
 *
 * Deliberately independent of settlement order — otherwise "whoever settles first
 * keeps the allowance" would depend on when someone pressed a button, and
 * re-settling an event could move money between events.
 */
export const resolveDayOwnership = (
  records: AllowanceRecord[]
): Map<string, string> => {
  const earliest = new Map<string, AllowanceRecord>();

  for (const record of records) {
    const start = toDate(record.startTime);
    if (!start) continue;

    for (const day of coveredBogotaDays(record)) {
      const current = earliest.get(day);

      if (!current) {
        earliest.set(day, record);
        continue;
      }

      const currentStart = toDate(current.startTime);
      if (!currentStart) {
        earliest.set(day, record);
        continue;
      }

      if (start.getTime() < currentStart.getTime()) {
        earliest.set(day, record);
      } else if (
        start.getTime() === currentStart.getTime() &&
        recordKey(record) < recordKey(current)
      ) {
        earliest.set(day, record);
      }
    }
  }

  const ownership = new Map<string, string>();
  for (const [day, record] of earliest) {
    ownership.set(day, String(record.eventId ?? ""));
  }

  return ownership;
};

/**
 * Allowance owed to one employee for one event.
 *
 * `recordsOnThoseDays` must span every event the employee worked on those days —
 * that is what makes the rule one-per-day rather than one-per-day-per-event.
 *
 * A day whose records already carry an embedded allowance pays nothing more. That
 * keeps every already-settled event's totals byte-identical, even if the allowance
 * amount has changed since those records were written.
 */
export const computeEmployeeAllowance = (
  recordsThisEvent: AllowanceRecord[],
  recordsOnThoseDays: AllowanceRecord[],
  auxPerDay: number,
  eventId: string
): EmployeeAllowance => {
  const ownership = resolveDayOwnership(recordsOnThoseDays);

  const daysThisEvent = new Set<string>();
  for (const record of recordsThisEvent) {
    for (const day of coveredBogotaDays(record)) daysThisEvent.add(day);
  }

  const embeddedDays = new Set<string>();
  for (const record of recordsOnThoseDays) {
    if ((record.auxiliaryTrasport ?? 0) <= 0) continue;
    for (const day of coveredBogotaDays(record)) embeddedDays.add(day);
  }

  let transportDays = 0;
  let legacyDays = 0;

  for (const day of daysThisEvent) {
    if (ownership.get(day) !== String(eventId)) continue;

    if (embeddedDays.has(day)) legacyDays += 1;
    else transportDays += 1;
  }

  return {
    transportDays,
    transportAllowance: transportDays * (auxPerDay || 0),
    legacyDays,
  };
};

/** Every Bogota day a set of records touches. */
export const daysTouchedByRecords = (
  records: AllowanceRecord[]
): string[] => {
  const days = new Set<string>();
  for (const record of records) {
    for (const day of coveredBogotaDays(record)) days.add(day);
  }
  return Array.from(days).sort();
};

/**
 * Exact UTC instants spanning a set of Bogota day keys: start of the first day to
 * end of the last. Bogota is UTC-5 year round, so the offset is a constant.
 *
 * Callers must query by OVERLAP, not by `startTime` falling inside the window — a
 * shift that begins the previous evening and crosses midnight still covers one of
 * these days, and a `startTime >= from` filter would miss it.
 */
export const bogotaDaysToInstantRange = (
  days: string[]
): { from: Date; to: Date } | null => {
  if (!days.length) return null;

  const sorted = [...days].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  return {
    from: new Date(`${first}T00:00:00.000-05:00`),
    to: new Date(
      new Date(`${last}T00:00:00.000-05:00`).getTime() + 24 * 60 * 60 * 1000
    ),
  };
};

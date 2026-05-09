import { HourBreakdown } from "../shared/models/hour-break-down.model";

const BOGOTA_TZ = "America/Bogota";
const STEP_MS = 15 * 60 * 1000; // 15 minutes

const formatBogotaParts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOGOTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    dateStr: `${get("year")}-${get("month")}-${get("day")}`,
    dayOfWeek: weekdayMap[get("weekday")] ?? 0,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
};

export interface ClassifyParams {
  startTime: Date;
  endTime: Date;
  holidayDates: Set<string>;
  maxOrdinaryHoursPerShift: number;
  workingDays: number[];
  dayShift: { start: number; end: number };
}

export const classifyWorkedHoursV2 = (
  params: ClassifyParams
): HourBreakdown => {
  const {
    startTime,
    endTime,
    holidayDates,
    maxOrdinaryHoursPerShift,
    workingDays,
    dayShift,
  } = params;

  const result: HourBreakdown = {
    ordinaryDayHours: 0,
    extraDayHours: 0,
    ordinaryNightHours: 0,
    extraNightHours: 0,
    sundayDayHours: 0,
    sundayNightHours: 0,
    extraSundayDayHours: 0,
    extraSundayNightHours: 0,
  };

  if (!startTime || !endTime) return result;

  const startMs = startTime.getTime();
  const endMs = endTime.getTime();

  if (endMs <= startMs) return result;

  let remainingOrdinary = maxOrdinaryHoursPerShift;
  const QUARTER = 0.25;

  for (let cursor = startMs; cursor < endMs; cursor += STEP_MS) {
    const tickDate = new Date(cursor);
    const { dateStr, dayOfWeek, hour, minute } = formatBogotaParts(tickDate);

    const decimalHour = hour + minute / 60;
    const isDayTime =
      decimalHour >= dayShift.start && decimalHour < dayShift.end;

    const isHoliday = holidayDates.has(dateStr);
    const isSundayOrHoliday =
      dayOfWeek === 0 || isHoliday || !workingDays.includes(dayOfWeek);

    const ordinarySlot = remainingOrdinary > 0;

    if (isSundayOrHoliday) {
      if (ordinarySlot && isDayTime) result.sundayDayHours += QUARTER;
      else if (ordinarySlot && !isDayTime) result.sundayNightHours += QUARTER;
      else if (!ordinarySlot && isDayTime)
        result.extraSundayDayHours += QUARTER;
      else result.extraSundayNightHours += QUARTER;
    } else {
      if (ordinarySlot && isDayTime) result.ordinaryDayHours += QUARTER;
      else if (ordinarySlot && !isDayTime) result.ordinaryNightHours += QUARTER;
      else if (!ordinarySlot && isDayTime) result.extraDayHours += QUARTER;
      else result.extraNightHours += QUARTER;
    }

    if (ordinarySlot) remainingOrdinary -= QUARTER;
  }

  return result;
};

export const collectDateStringsBogota = (
  startTime: Date,
  endTime: Date
): string[] => {
  const dates = new Set<string>();
  const startMs = startTime.getTime();
  const endMs = endTime.getTime();

  for (let cursor = startMs; cursor <= endMs; cursor += STEP_MS) {
    const { dateStr } = formatBogotaParts(new Date(cursor));
    dates.add(dateStr);
  }

  return Array.from(dates);
};

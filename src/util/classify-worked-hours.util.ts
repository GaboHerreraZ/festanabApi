import { HourBreakdown } from "../shared/models/hour-break-down.model";

export const classifyWorkedHours = (
  startHour: number,
  endHour: number,
  dayOfWeek: number,
  isHoliday: boolean = false,
  params: any
): HourBreakdown => {
  if (endHour <= startHour) endHour += 24;

  const isSundayOrHoliday =
    dayOfWeek === 0 ||
    isHoliday ||
    !params.ordinaryShift.workingDays.includes(dayOfWeek);

  let remainingOrdinaryHours = params.ordinaryShift.maxDailyHours;

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

  for (let h = startHour; h < endHour; h += 0.25) {
    const realHour = h % 24;
    const isDayTime =
      realHour >= params.timeRanges.dayShift.start &&
      realHour < params.timeRanges.dayShift.end;

    if (isSundayOrHoliday) {
      if (remainingOrdinaryHours > 0) {
        if (isDayTime) {
          result.sundayDayHours += 0.25;
        } else {
          result.sundayNightHours += 0.25;
        }
        remainingOrdinaryHours -= 0.25;
      } else {
        if (isDayTime) {
          result.extraSundayDayHours += 0.25;
        } else {
          result.extraSundayNightHours += 0.25;
        }
      }
    } else {
      if (remainingOrdinaryHours > 0) {
        if (isDayTime) {
          result.ordinaryDayHours += 0.25;
        } else {
          result.ordinaryNightHours += 0.25;
        }
        remainingOrdinaryHours -= 0.25;
      } else {
        if (isDayTime) {
          result.extraDayHours += 0.25;
        } else {
          result.extraNightHours += 0.25;
        }
      }
    }
  }

  return result;
};

import { ISetting } from "../components/setting/model/setting.model";

export const buildWorkParams = (settings: ISetting) => {
  return {
    ordinaryShift: {
      maxDailyHours: 7,
      workingDays: [0, 1, 2, 3, 4, 5, 6], // Monday to Saturday
    },
    timeRanges: {
      dayShift: { start: 6, end: 18 }, // 6:00 AM – 6:00 PM
      nightShift: { start: 18, end: 6 }, // 6:00 PM – 6:00 AM (next day)
    },
    rates: {
      ordinary: 1,
      extraDay: 1 + settings.daytimeOvertimeHour / 100, // Recargo Hora Extra Diurna
      ordinaryNight: 1 + settings.regularNighttimeHour / 100, // Hora Nocturna Ordinaria
      extraNight: 1 + settings.nighttimeOvertimeHour / 100, // Hora Extra Nocturna
      sundayDay: 1 + settings.sundayAndHolidayHour / 100, // Hora Dominicales y Festivos
      sundayNight: 1 + settings.nightWorkSundayHoliday / 100, // Trabajo Nocturno Dominical o Festivo
      extraSundayDay: 1 + settings.daytimeOvertimeSundayHoliday / 100, // Hora Extra Diurna Dominicales y Festivos
      extraSundayNight: 1 + settings.nighttimeOvertimeSundayHoliday / 100, // Hora Extra Nocturna Dominicales y Festivos
    },
  };
};

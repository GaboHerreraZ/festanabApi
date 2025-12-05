import { ISetting } from "../components/setting/model/setting.model";

const roundToThousands = (value: number) => {
  return Math.round(value / 1000) * 1000;
};

export const buildRates = (
  hourUpdated: any,
  getTotalDays: any,
  workParams: any,
  settings: ISetting
) => {
  const { hasHour, ...rest } = hourUpdated;

  return {
    ...rest,
    hrsOrd: getTotalDays.ordinaryDayHours,
    valHrsOrd: roundToThousands(getTotalDays.ordinaryDayHours * rest.hourPrice),
    hrsExtDia: getTotalDays.extraDayHours,
    valExtDia: roundToThousands(
      getTotalDays.extraDayHours * rest.hourPrice * workParams.rates.extraDay
    ),
    hrsNoc: getTotalDays.ordinaryNightHours,
    valHrsNoc: roundToThousands(
      getTotalDays.ordinaryNightHours *
        rest.hourPrice *
        workParams.rates.ordinaryNight
    ),
    hrsExtNoc: getTotalDays.extraNightHours,
    valExtNoc: roundToThousands(
      getTotalDays.extraNightHours *
        rest.hourPrice *
        workParams.rates.extraNight
    ),
    hrsDomDia: getTotalDays.sundayDayHours,
    valDomDia: roundToThousands(
      getTotalDays.sundayDayHours * rest.hourPrice * workParams.rates.sundayDay
    ),
    hrsExtDomDia: getTotalDays.extraSundayDayHours,
    valExtDomDia: roundToThousands(
      getTotalDays.extraSundayDayHours *
        rest.hourPrice *
        workParams.rates.extraSundayDay
    ),
    hrsDomNoc: getTotalDays.sundayNightHours,
    valDomNoc: roundToThousands(
      getTotalDays.sundayNightHours *
        rest.hourPrice *
        workParams.rates.sundayNight
    ),
    hrsExtDomNoc: getTotalDays.extraSundayNightHours,
    valExtDomNoc: roundToThousands(
      getTotalDays.extraSundayNightHours *
        rest.hourPrice *
        workParams.rates.extraSundayNight
    ),
    auxiliaryTrasport: hasHour ? 0 : settings.auxiliaryTrasport,
    total: roundToThousands(
      rest.hourPrice *
        (getTotalDays.ordinaryDayHours +
          getTotalDays.extraDayHours * workParams.rates.extraDay +
          getTotalDays.ordinaryNightHours * workParams.rates.ordinaryNight +
          getTotalDays.extraNightHours * workParams.rates.extraNight +
          getTotalDays.sundayDayHours * workParams.rates.sundayDay +
          getTotalDays.sundayNightHours * workParams.rates.sundayNight +
          getTotalDays.extraSundayDayHours * workParams.rates.extraSundayDay +
          getTotalDays.extraSundayNightHours *
            workParams.rates.extraSundayNight) +
        settings.auxiliaryTrasport
    ),
  };
};

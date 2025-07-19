import { ISetting } from "../components/setting/model/setting.model";

export const buildRates = (
  hourUpdated: any,
  getTotalDays: any,
  workParams: any,
  settings: ISetting
) => {
  return {
    ...hourUpdated,
    hrsOrd: getTotalDays.ordinaryDayHours,
    valHrsOrd: getTotalDays.ordinaryDayHours * hourUpdated.hourPrice,
    hrsExtDia: getTotalDays.extraDayHours,
    valExtDia:
      getTotalDays.extraDayHours *
      hourUpdated.hourPrice *
      workParams.rates.extraDay,
    hrsNoc: getTotalDays.ordinaryNightHours,
    valHrsNoc:
      getTotalDays.ordinaryNightHours *
      hourUpdated.hourPrice *
      workParams.rates.ordinaryNight,
    hrsExtNoc: getTotalDays.extraNightHours,
    valExtNoc:
      getTotalDays.extraNightHours *
      hourUpdated.hourPrice *
      workParams.rates.extraNight,
    hrsDomDia: getTotalDays.sundayDayHours,
    valDomDia:
      getTotalDays.sundayDayHours *
      hourUpdated.hourPrice *
      workParams.rates.sundayDay,
    hrsExtDomDia: getTotalDays.extraSundayDayHours,
    valExtDomDia:
      getTotalDays.extraSundayDayHours *
      hourUpdated.hourPrice *
      workParams.rates.extraSundayDay,
    hrsDomNoc: getTotalDays.sundayNightHours,
    valDomNoc:
      getTotalDays.sundayNightHours *
      hourUpdated.hourPrice *
      workParams.rates.sundayNight,
    hrsExtDomNoc: getTotalDays.extraSundayNightHours,
    valExtDomNoc:
      getTotalDays.extraSundayNightHours *
      hourUpdated.hourPrice *
      workParams.rates.extraSundayNight,
    auxiliaryTrasport: settings.auxiliaryTrasport,
    total:
      hourUpdated.hourPrice *
        (getTotalDays.ordinaryDayHours +
          getTotalDays.extraDayHours * workParams.rates.extraDay +
          getTotalDays.ordinaryNightHours * workParams.rates.ordinaryNight +
          getTotalDays.extraNightHours * workParams.rates.extraNight +
          getTotalDays.sundayDayHours * workParams.rates.sundayDay +
          getTotalDays.sundayNightHours * workParams.rates.sundayNight +
          getTotalDays.extraSundayDayHours * workParams.rates.extraSundayDay +
          getTotalDays.extraSundayNightHours *
            workParams.rates.extraSundayNight) +
      settings.auxiliaryTrasport,
  };
};

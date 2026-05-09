import { NextFunction, Request, Response } from "express";
import {
  createHour,
  updateHour,
  getEventHourById,
  deleteHour,
  setHourApproval,
  getEmployeeEventsByCc,
  findOverlappingHour,
} from "../service/hour.service";
import { AuthenticatedRequest } from "../../../middleware/verifyToken";
import { IHour } from "../model/hour.model";
import { getSetting } from "../../setting/service/setting.service";
import { ISetting } from "../../setting/model/setting.model";
import { buildWorkParams } from "../../../util/build-work-params.util";
import { buildRates } from "../../../util/build-rates.util";
import {
  classifyWorkedHoursV2,
  collectDateStringsBogota,
} from "../../../util/classify-worked-hours-v2.util";
import { getHolidaysInRange } from "../../../util/get-holidays-in-range.util";

const addNewHour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const overlap = await checkOverlap(data);
    if (overlap) {
      res.status(409).json({
        message:
          "El rango de horas se solapa con un registro existente del mismo empleado en este evento",
        conflict: overlap,
      });
      return;
    }

    const settings = await getSetting();
    const workParams = buildWorkParams(settings as ISetting);

    let hourUpdated = getTotalHours(data);
    hourUpdated = await computeHourTotals(
      hourUpdated,
      workParams,
      settings as ISetting
    );

    const { _id, ...rest } = hourUpdated;

    const hour = await createHour(rest);

    res.status(201).json({ data: hour });
  } catch (error) {
    console.log("error amigazoo", error);
    next(error);
  }
};

const editHour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const overlap = await checkOverlap(data, data._id);
    if (overlap) {
      res.status(409).json({
        message:
          "El rango de horas se solapa con un registro existente del mismo empleado en este evento",
        conflict: overlap,
      });
      return;
    }

    const settings = await getSetting();
    const workParams = buildWorkParams(settings as ISetting);

    let hourUpdated = getTotalHours(data);
    hourUpdated = await computeHourTotals(
      hourUpdated,
      workParams,
      settings as ISetting
    );

    hourUpdated.observations = null;
    hourUpdated.approved = false;
    hourUpdated.approvedBy = null;
    hourUpdated.approvedAt = null;

    const hour = await updateHour(hourUpdated);

    res.status(201).json({ data: hour });
  } catch (error) {
    next(error);
  }
};

const getHoursByEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;

    const hours = await getEventHourById(eventId);

    res.status(201).json({ data: hours });
  } catch (error) {
    next(error);
  }
};

const getEventsByEmployeeCc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cc } = req.params;

    const events = await getEmployeeEventsByCc(cc);

    res.status(200).json({ data: events });
  } catch (error) {
    next(error);
  }
};

const deleteHourById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const hours = await deleteHour(id);

    res.status(201).json({ data: hours });
  } catch (error) {
    next(error);
  }
};

const setApprovalHour = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { approved, observations } = req.body;

    if (typeof approved !== "boolean") {
      res.status(400).json({ message: "'approved' must be a boolean" });
      return;
    }

    const hour = await setHourApproval(
      id,
      approved,
      req.user?.id,
      observations ?? null
    );

    if (!hour) {
      res.status(404).json({ message: "Hour not found" });
      return;
    }

    res.status(200).json({ data: hour });
  } catch (error) {
    next(error);
  }
};

const debugClassifyHours = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startTime, endTime, hourPrice } = req.body;

    if (!startTime || !endTime || typeof hourPrice !== "number") {
      res.status(400).json({
        message: "startTime, endTime and hourPrice are required",
      });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    if (end.getTime() <= start.getTime()) {
      res
        .status(400)
        .json({ message: "endTime must be greater than startTime" });
      return;
    }

    const settings = await getSetting();
    const workParams = buildWorkParams(settings as ISetting);

    const computed = await computeHourTotals(
      { startTime: start, endTime: end, hourPrice, date: start },
      workParams,
      settings as ISetting
    );

    res.status(200).json({
      data: {
        date: computed.date,
        startTime: computed.startTime,
        endTime: computed.endTime,
        hourPrice: computed.hourPrice,
        hrsOrd: computed.hrsOrd,
        valHrsOrd: computed.valHrsOrd,
        hrsExtDia: computed.hrsExtDia,
        valExtDia: computed.valExtDia,
        hrsNoc: computed.hrsNoc,
        valHrsNoc: computed.valHrsNoc,
        hrsExtNoc: computed.hrsExtNoc,
        valExtNoc: computed.valExtNoc,
        hrsDomDia: computed.hrsDomDia,
        valDomDia: computed.valDomDia,
        hrsExtDomDia: computed.hrsExtDomDia,
        valExtDomDia: computed.valExtDomDia,
        hrsDomNoc: computed.hrsDomNoc,
        valDomNoc: computed.valDomNoc,
        hrsExtDomNoc: computed.hrsExtDomNoc,
        valExtDomNoc: computed.valExtDomNoc,
        auxiliaryTrasport: computed.auxiliaryTrasport,
        total: computed.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const checkOverlap = async (data: any, excludeId?: string) => {
  if (!data?.eventId || !data?.employeeId || !data?.startTime || !data?.endTime)
    return null;

  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  if (end.getTime() <= start.getTime()) return null;

  return await findOverlappingHour({
    eventId: data.eventId,
    employeeId: data.employeeId,
    startTime: start,
    endTime: end,
    excludeId,
  });
};

const computeHourTotals = async (
  hour: any,
  workParams: any,
  settings: ISetting
) => {
  if (!hour.startTime || !hour.endTime) return hour;

  const start = new Date(hour.startTime);
  const end = new Date(hour.endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return hour;
  if (end.getTime() <= start.getTime()) return hour;

  const dateStrings = collectDateStringsBogota(start, end);
  const holidayDates = await getHolidaysInRange(dateStrings);

  const breakdown = classifyWorkedHoursV2({
    startTime: start,
    endTime: end,
    holidayDates,
    maxOrdinaryHoursPerShift: workParams.ordinaryShift.maxDailyHours,
    workingDays: workParams.ordinaryShift.workingDays,
    dayShift: workParams.timeRanges.dayShift,
  });

  const computed = buildRates(
    { ...hour, hasHour: false },
    breakdown,
    workParams,
    settings
  );

  const daysCovered = dateStrings.length || 1;
  const auxiliaryPerDay = settings.auxiliaryTrasport ?? 0;
  const auxiliaryTotal = auxiliaryPerDay * daysCovered;

  const baseTotalWithoutAux = computed.total - (computed.auxiliaryTrasport ?? 0);

  return {
    ...computed,
    auxiliaryTrasport: auxiliaryTotal,
    total: baseTotalWithoutAux + auxiliaryTotal,
  };
};

export {
  addNewHour,
  editHour,
  getHoursByEvent,
  deleteHourById,
  setApprovalHour,
  getEventsByEmployeeCc,
  debugClassifyHours,
};

const getTotalHours = (hour: any) => {
  const { _id, date, startTime, endTime, hourPrice, ...rest } = hour;
  return !endTime
    ? {
        ...rest,
        date,
        startTime,
        endTime,
        hourPrice,
      }
    : ({
        ...rest,
        _id,
        date,
        startTime,
        endTime,
        hourPrice,
      } as IHour);
};

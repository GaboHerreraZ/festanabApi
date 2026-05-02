import { NextFunction, Request, Response } from "express";
import {
  createHour,
  updateHour,
  getEventHourById,
  deleteHour,
  setHourApproval,
  getEmployeeEventsByCc,
} from "../service/hour.service";
import { AuthenticatedRequest } from "../../../middleware/verifyToken";
import { IHour } from "../model/hour.model";
import { getSetting } from "../../setting/service/setting.service";
import { ISetting } from "../../setting/model/setting.model";
import { classifyWorkedHours } from "../../../util/classify-worked-hours.util";
import { buildWorkParams } from "../../../util/build-work-params.util";
import { getHourNumber } from "../../../util/get-hour-number.util";
import { buildRates } from "../../../util/build-rates.util";
import { holidayInColombia } from "../../../util/check-if-day-holiday.util";

const addNewHour = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const settings = await getSetting();

    const workParams = buildWorkParams(settings as ISetting);

    const startHour = getHourNumber(data.startTime);
    const endHour = getHourNumber(data.endTime);
    const dayOfWeek = new Date(data.date).getDay();

    const isHoliday = await holidayInColombia(new Date(data.date));

    const getTotalDays = classifyWorkedHours(
      startHour,
      endHour,
      dayOfWeek,
      isHoliday,
      workParams
    );

    let hourUpdated = getTotalHours(data);

    hourUpdated = buildRates(hourUpdated, getTotalDays, workParams, settings);

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

    const settings = await getSetting();

    const workParams = buildWorkParams(settings as ISetting);

    const startHour = getHourNumber(data.startTime);
    const endHour = getHourNumber(data.endTime);
    const dayOfWeek = new Date(data.date).getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    const isHoliday = await holidayInColombia(new Date(data.date));

    const getTotalDays = classifyWorkedHours(
      startHour,
      endHour,
      dayOfWeek,
      isHoliday,
      workParams
    );

    let hourUpdated = getTotalHours(data);

    hourUpdated = buildRates(hourUpdated, getTotalDays, workParams, settings);

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

export {
  addNewHour,
  editHour,
  getHoursByEvent,
  deleteHourById,
  setApprovalHour,
  getEventsByEmployeeCc,
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

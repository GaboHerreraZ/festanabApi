import { NextFunction, Response, Request } from "express";
import {
  addNewEvent,
  getAllEvent,
  updateEvent,
  updateEventStatus,
  getEventId,
  getTotalsByEvent,
  createCustomerQuotes,
  getAllCustomerQuotes,
  deleteCustomerQuote,
  getCustomerQuoteById,
  deleteEvent,
  deleteCustomerQuoteByEventId,
} from "../service/event.service";
import { IEvent } from "../model/event.model";
import {
  addNewEventDetail,
  deleteEventDetail,
  getEventDetailByEventId,
} from "../service/event-detail.service";
import { IEventDetail } from "../model/event-detail.model";
import mongoose, { Types } from "mongoose";
import {
  deleteHourByEventId,
  getEmployeeWithRecords,
  getEventHourById,
} from "../service/hour.service";
import {
  deleteEmployeeServiceByEventId,
  getTotalEmployeeServices,
} from "../service/employee-service.service";
import {
  createEventBilling,
  deleteEventBillingByEventId,
  getEventBillingById,
} from "../service/event-billing.service";
import { IEventBilling } from "../model/event-billing.model";

const getEventById = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = _.params;
    const event = await getEventId(id);

    res.status(201).json({
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

const getEvents = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = _.params;
    const events = await getAllEvent(status);

    res.status(201).json({
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEventById = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = _.params;
    await deleteEvent(id);

    await deleteHourByEventId(id);

    await deleteEventDetail(id);

    await deleteCustomerQuoteByEventId(id);

    await deleteEmployeeServiceByEventId(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const addEditEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, ...rest } = req.body;

    if (!_id) {
      const newItem = await addNewEvent(
        rest.description,
        rest.owner,
        rest.date,
        rest.time,
        rest.location,
        rest.nit,
        rest.customerId
      );
      res.status(201).json({
        data: newItem,
      });

      return;
    }

    const event = {
      _id,
      description: rest.description,
      owner: rest.owner,
      date: rest.date,
      time: rest.time,
      location: rest.location,
      nit: rest.nit,
    } as IEvent;

    const editItem = await updateEvent(event);
    res.status(201).json({
      data: editItem,
    });
  } catch (error) {
    next(error);
  }
};

const updateEventStatusById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, status } = req.body;

    const editItem = await updateEventStatus(_id, status);
    res.status(201).json({
      data: editItem,
    });
  } catch (error) {
    next(error);
  }
};

const getTotalsByEventId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;
    const totals = await getTotalsByEvent(eventId);

    res.status(201).json({
      data: totals,
    });
  } catch (error) {
    next(error);
  }
};

const clone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;

    const eventToClone = await getEventId(eventId);
    if (!eventToClone) throw new Error("Event not found");

    const newEvent: IEvent = await addNewEvent(
      eventToClone.description + " (CLONE)",
      eventToClone.owner + " (CLONE)",
      eventToClone.date,
      eventToClone.time,
      eventToClone.location + " (CLONE)",
      eventToClone.nit,
      eventToClone.customerId.toString()
    );

    const eventDetail = await getEventDetailByEventId(eventId);

    const newEventDetail = {
      eventId: newEvent._id as Types.ObjectId,
      section: eventDetail
        ? eventDetail.section.map((section) => ({
            _id: new mongoose.Types.ObjectId(),
            name: section.name,
            description: section.description,
            type: section.type,
            items: section.items.map((item) => ({
              _id: new mongoose.Types.ObjectId(),
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              rentalPrice: item.rentalPrice ? item.rentalPrice : 0,
              costPrice: item.costPrice ? item.costPrice : 0,
              done: false,
              disabled: item.disabled,
              owner: item.owner,
            })),
          }))
        : [],
    } as IEventDetail;

    const newEventCreated = await addNewEventDetail(newEventDetail);

    res.status(201).json({
      data: newEventCreated.toObject(),
    });
  } catch (error) {
    next(error);
  }
};

const newCustomerQuote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.body;

    const totals = await getTotalsByEvent(eventId);
    const detail = await getEventDetailByEventId(eventId);

    const { _id, ...rest } = totals;

    const customerQuote = {
      ...rest,
      utility: rest.totalRentalPrice - rest.totalHourCost - rest.totalBillValue,
      _id: new mongoose.Types.ObjectId(),
      eventId: new mongoose.Types.ObjectId(eventId),
      detail: {
        eventId: detail.eventId,
        section: detail.section,
      },
      createdAt: new Date(),
    };

    const event = await createCustomerQuotes(customerQuote);

    res.status(201).json({
      data: {
        ...customerQuote,
        _id: event._id,
        detail,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerQuotesByEventId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;
    const quotes = await getAllCustomerQuotes(eventId);

    res.status(201).json({
      data: quotes,
    });
  } catch (error) {
    next(error);
  }
};

const deleteQuoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const hours = await deleteCustomerQuote(id);

    res.status(201).json({ data: hours });
  } catch (error) {
    next(error);
  }
};

const getQuoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const quote = await getCustomerQuoteById(id);
    res.status(201).json({ data: quote });
  } catch (error) {
    next(error);
  }
};

const setEventBilling = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const event = await getEventId(id);

    const billing = await getEmployeeWithRecords(id);

    const settle = {
      event: {
        ...event,
        billing,
      },
    };

    await deleteEventBillingByEventId(id);

    const eventBilling = await createEventBilling(
      settle as any as IEventBilling
    );

    res.status(201).json({ data: billing });
  } catch (error) {
    next(error);
  }
};

const getEventBilling = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const quote = await getEventBillingById(id);
    res.status(201).json({ data: quote });
  } catch (error) {
    next(error);
  }
};

export const groupByEmployee = (event: any) => {
  const result: any = {};

  // --- Agrupar HOURS ---
  for (const h of event.hours ?? []) {
    const id = h.employeeId;

    if (!result[id]) {
      result[id] = {
        employeeId: id,
        employee: h.employee,
        cc: h.cc,
        hours: [],
        services: [],
      };
    }

    result[id].hours.push(...h.records);
  }

  // --- Agrupar SERVICES ---
  for (const s of event.services ?? []) {
    const id = s.employeeId;

    if (!result[id]) {
      result[id] = {
        employeeId: id,
        employee: s.employee,
        cc: s.cc,
        hours: [],
        services: [],
      };
    }

    result[id].services.push(...s.services);
  }

  // Convertir objeto → array
  return Object.values(result);
};

export {
  getEvents,
  addEditEvent,
  getTotalsByEventId,
  getEventById,
  clone,
  newCustomerQuote,
  getCustomerQuotesByEventId,
  deleteQuoteById,
  getQuoteById,
  updateEventStatusById,
  deleteEventById,
  setEventBilling,
  getEventBilling,
};

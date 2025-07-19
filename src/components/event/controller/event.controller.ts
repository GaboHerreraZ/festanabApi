import { NextFunction, Response, Request } from "express";
import {
  addNewEvent,
  getAllEvent,
  updateEvent,
  getEventId,
  getTotalsByEvent,
} from "../service/event.service";
import { IEvent } from "../model/event.model";

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
    const events = await getAllEvent();

    res.status(201).json({
      data: events,
    });
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
        rest.name,
        rest.description,
        rest.owner,
        rest.phoneNumber,
        rest.date,
        rest.time,
        rest.location,
        rest.nit
      );
      res.status(201).json({
        data: newItem,
      });

      return;
    }

    const event = {
      _id,
      name: rest.name,
      description: rest.description,
      owner: rest.owner,
      phoneNumber: rest.phoneNumber,
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

export { getEvents, addEditEvent, getTotalsByEventId, getEventById };

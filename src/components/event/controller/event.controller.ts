import { NextFunction, Response, Request } from "express";
import {
  addNewEvent,
  getAllEvent,
  updateEvent,
  getTotalsByEvent,
} from "../service/event.service";
import { IEvent } from "../model/event.model";

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
    const { _id, name, description, owner, phoneNumber, date, time } = req.body;

    if (!_id) {
      const newItem = await addNewEvent(
        name,
        description,
        owner,
        phoneNumber,
        date,
        time
      );
      res.status(201).json({
        data: newItem,
      });

      return;
    }

    const event = {
      _id,
      name,
      description,
      owner,
      phoneNumber,
      date,
      time,
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

export { getEvents, addEditEvent, getTotalsByEventId };

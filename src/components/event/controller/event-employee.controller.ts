import { NextFunction, Request, Response } from "express";
import {
  assignEmployeeToEvent,
  getEmployeesByEventId,
  deleteEventEmployeeById,
} from "../service/event-employee.service";

const addEventEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId, employeeId } = req.body;

    if (!eventId || !employeeId) {
      res
        .status(400)
        .json({ message: "eventId and employeeId are required" });
      return;
    }

    const assignment = await assignEmployeeToEvent({
      eventId,
      employeeId,
    });

    res.status(201).json({ data: assignment });
  } catch (error) {
    next(error);
  }
};

const getEventEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;

    const assignments = await getEmployeesByEventId(eventId);

    res.status(200).json({ data: assignments });
  } catch (error) {
    next(error);
  }
};

const deleteEventEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deleted = await deleteEventEmployeeById(id);

    if (!deleted) {
      res.status(404).json({ message: "Assignment not found" });
      return;
    }

    res.status(200).json({ data: deleted });
  } catch (error) {
    next(error);
  }
};

export { addEventEmployee, getEventEmployees, deleteEventEmployee };

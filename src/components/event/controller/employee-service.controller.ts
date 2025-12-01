import { NextFunction, Request, Response } from "express";
import {
  createEmployeeService,
  deleteEmployeeService,
  getEventEmployeeServiceById,
  updateEmployeeService,
} from "../service/employee-service.service";

const addNewEmployeeService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    const employeeService = await createEmployeeService(data);

    res.status(201).json({ data: employeeService });
  } catch (error) {
    console.log("error amigazoo", error);
    next(error);
  }
};

const editEmployeeService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    const employeeService = await updateEmployeeService(data);

    res.status(201).json({ data: employeeService });
  } catch (error) {
    next(error);
  }
};

const deleteEmployeeServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const employeeService = await deleteEmployeeService(id);

    res.status(201).json({ data: employeeService });
  } catch (error) {
    next(error);
  }
};

const getEmployeeServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;

    const employeeServices = await getEventEmployeeServiceById(eventId);

    res.status(201).json({ data: employeeServices });
  } catch (error) {
    next(error);
  }
};

export {
  addNewEmployeeService,
  editEmployeeService,
  deleteEmployeeServiceById,
  getEmployeeServiceById,
};

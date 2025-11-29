import { NextFunction, Response, Request } from "express";
import {
  getAllEmployees,
  addNewEmployee,
  updateEmployee,
  deleteEmployee,
} from "../service/employee.service";
import { IEmployee } from "../model/employee.model";

const getEmployees = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const inventory = await getAllEmployees();

    res.status(201).json({
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

const addEditEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, name, cc, hourPrice } = req.body;

    console.log("body", req.body);

    if (!_id) {
      const newEmployee = await addNewEmployee(name, cc, hourPrice);
      res.status(201).json({
        data: newEmployee,
      });

      return;
    }

    const employee = {
      _id,
      name,
      cc,
      hourPrice,
    } as IEmployee;

    const editItem = await updateEmployee(employee);
    res.status(201).json({
      data: editItem,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployeeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const editItem = await deleteEmployee(id);
    res.status(201).json({
      data: editItem,
    });
  } catch (error) {
    next(error);
  }
};

export { getEmployees, addEditEmployee, deleteEmployeeById };

import { NextFunction, Response, Request } from "express";
import {
  addNewCustomer,
  updateCustomer,
  getAllCustomers,
  findCustomerByName,
  deleteCustomer,
} from "../service/customer.service";
import { ICustomer } from "../model/customer.model";

const getCustomers = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await getAllCustomers();

    res.status(201).json({
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

const addEditCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, name, nit } = req.body;

    console.log("body", req.body);

    if (!_id) {
      const newCustomer = await addNewCustomer(name, nit);
      res.status(201).json({
        data: newCustomer,
      });

      return;
    }

    const customer = {
      _id,
      name,
      nit,
    } as ICustomer;

    const editItem = await updateCustomer(customer);
    res.status(201).json({
      data: editItem,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerByName = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = _.params;
    const customers = await findCustomerByName(name);

    res.status(201).json({
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const editItem = await deleteCustomer(id);
    res.status(201).json({
      data: editItem,
    });
  } catch (error) {
    next(error);
  }
};

export { getCustomers, addEditCustomer, getCustomerByName, deleteCustomerById };

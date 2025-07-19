import { NextFunction, Request, Response } from "express";
import {
  createBill,
  deleteBill,
  getBillsByEventId,
  updateBill,
} from "../service/bill.service";

const getBillsByEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;

    const bills = await getBillsByEventId(eventId);

    res.status(200).json({ data: bills });
  } catch (error) {
    next(error);
  }
};

const createOrUpdateBill = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const billData = req.body;

    let result;

    if (billData._id) {
      // Actualizar
      result = await updateBill(billData._id, billData);
    } else {
      // Crear
      result = await createBill(billData);
    }

    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const deleteBillById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deleted = await deleteBill(id);

    res.status(200).json({ message: "Bill deleted", data: deleted });
  } catch (error) {
    next(error);
  }
};

export { getBillsByEvent, createOrUpdateBill, deleteBillById };

import { NextFunction, Response, Request } from "express";
import {
  getAllInventory,
  addNewItemToInventory,
  updateInventoryItem,
  findProductsByName,
} from "../service/inventory.service";
import { IProduct } from "../model/inventory.model";

const getInventory = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const inventory = await getAllInventory();

    res.status(201).json({
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryByName = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = _.params;
    const inventory = await findProductsByName(name);

    res.status(201).json({
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

const addEditItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id, name, quantity, rentalPrice } = req.body;

    if (!_id) {
      const newItem = await addNewItemToInventory(name, quantity, rentalPrice);
      res.status(201).json({
        data: newItem,
      });

      return;
    }

    const product = {
      _id,
      name,
      quantity,
      rentalPrice,
    } as IProduct;

    const editItem = await updateInventoryItem(product);
    res.status(201).json({
      data: editItem,
    });
  } catch (error) {
    next(error);
  }
};

export { getInventory, addEditItem, getInventoryByName };

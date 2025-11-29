import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/verifyToken";
import {
  getAllServices,
  addNewService,
  deleteService,
  updateService,
} from "../service/service.service";
import { IService } from "../model/service.model";

const getAllServicesAvailable = async (
  __: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const services = await getAllServices();
    res.status(201).json({
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

const addEditService = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, service, price, description } = req.body;
    if (!_id) {
      const newService = await addNewService(service, price, description);

      res.status(201).json({
        data: newService,
      });

      return;
    }

    const serviceEdit = {
      _id,
      service,
      price,
      description,
    } as IService;

    const editService = await updateService(serviceEdit);
    res.status(201).json({
      data: editService,
    });
  } catch (error) {
    next(error);
  }
};

const deleteServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const editItem = await deleteService(id);
    res.status(201).json({
      data: editItem,
    });
  } catch (error) {
    next(error);
  }
};

export { getAllServicesAvailable, addEditService, deleteServiceById };

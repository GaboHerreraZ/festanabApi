import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/verifyToken";
import {
  getAllModules,
  addNewModule,
  deleteModule,
  updateModule,
} from "../service/module.service";
import { IModule } from "../model/module.model";

const getAllModulesAvailable = async (
  __: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const modules = await getAllModules();
    res.status(201).json({
      data: modules,
    });
  } catch (error) {
    next(error);
  }
};

const addEditModule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, module } = req.body;
    if (!_id) {
      const newModule = await addNewModule(module);

      res.status(201).json({
        data: newModule,
      });

      return;
    }

    const moduleEdit = {
      _id,
      module,
    } as IModule;

    const editModule = await updateModule(moduleEdit);
    res.status(201).json({
      data: editModule,
    });
  } catch (error) {
    next(error);
  }
};

const deleteModuleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const editItem = await deleteModule(id);
    res.status(201).json({
      data: editItem,
    });
  } catch (error) {
    next(error);
  }
};

export { getAllModulesAvailable, addEditModule, deleteModuleById };

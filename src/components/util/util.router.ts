import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken";
import {
  getAllModulesAvailable,
  addEditModule,
  deleteModuleById,
} from "./controller/module.controller";
import {
  addEditService,
  deleteServiceById,
  getAllServicesAvailable,
} from "./controller/service.controller";

const utilRouter: Router = Router();

//Module
utilRouter.get("/module/all", verifyToken, getAllModulesAvailable);
utilRouter.post("/module/add-edit-module", verifyToken, addEditModule);
utilRouter.delete("/module/delete-module/:id", verifyToken, deleteModuleById);

//Service
utilRouter.get("/services/all", verifyToken, getAllServicesAvailable);
utilRouter.post("/services/add-edit-service", verifyToken, addEditService);
utilRouter.delete(
  "/services/delete-service/:id",
  verifyToken,
  deleteServiceById
);

utilRouter.get("/version", getAllModulesAvailable);

export default utilRouter;

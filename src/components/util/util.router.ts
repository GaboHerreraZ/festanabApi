import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken";
import {
  getAllModulesAvailable,
  addEditModule,
  deleteModuleById,
} from "./controller/module.controller";

const utilRouter: Router = Router();

//Module
utilRouter.get("/module/all", verifyToken, getAllModulesAvailable);
utilRouter.post("/module/add-edit-module", verifyToken, addEditModule);
utilRouter.delete("/delete-module/:id", verifyToken, deleteModuleById);

utilRouter.get("/version", getAllModulesAvailable);

export default utilRouter;

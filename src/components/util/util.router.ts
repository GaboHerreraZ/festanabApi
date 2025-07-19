import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken";
import {
  getAllModulesAvailable,
  addEditModule,
} from "./controller/module.controller";

const utilRouter: Router = Router();

//Module
utilRouter.get("/module/all", verifyToken, getAllModulesAvailable);
utilRouter.post("/module/add-edit-module", verifyToken, addEditModule);

utilRouter.get("/version", (__, res) => {
  res.status(200).json({
    version: "1.0.0",
    message: "Welcome to the Event Management API",
  });
});

export default utilRouter;

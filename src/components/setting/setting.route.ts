import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken";
import {
  getAppSetting,
  updateAppSetting,
} from "./controller/setting.controller";

const settingRouter: Router = Router();

// Obtener la configuración general
settingRouter.get("/setting", verifyToken, getAppSetting);

// Actualizar la configuración general
settingRouter.post("/setting", verifyToken, updateAppSetting);

export default settingRouter;

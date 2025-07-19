import express, { Router } from "express";
import utilRouter from "./components/util/util.router";
import inventoryRouter from "./components/inventory/inventory.router";
import employeeRouter from "./components/employee/employee.router";
import eventRouter from "./components/event/event.router";
import settingRouter from "./components/setting/setting.route";

const routes: Router = express.Router();
routes.use("/util", utilRouter);
routes.use("/inventory", inventoryRouter);
routes.use("/employee", employeeRouter);
routes.use("/event", eventRouter);
routes.use("/setting", settingRouter);

export default routes;

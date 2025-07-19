import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken";
import {
  getEmployees,
  addEditEmployee,
} from "./controller/employee.controller";

const employeeRouter: Router = Router();

employeeRouter.get("/get-employees", verifyToken, getEmployees);
employeeRouter.post("/add-edit-employee", verifyToken, addEditEmployee);

export default employeeRouter;

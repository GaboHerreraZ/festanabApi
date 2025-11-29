import { Router } from "express";
import {
  addEditCustomer,
  getCustomerByName,
  getCustomers,
  deleteCustomerById,
} from "./controller/customer.controller";
import { verifyToken } from "../../middleware/verifyToken";

const customerRouter: Router = Router();

customerRouter.get("/get-customers", verifyToken, getCustomers);
customerRouter.post("/add-edit-customer", verifyToken, addEditCustomer);
customerRouter.get(
  "/get-customer-by-name/:name",
  verifyToken,
  getCustomerByName
);

customerRouter.delete("/delete-customer/:id", verifyToken, deleteCustomerById);

export default customerRouter;

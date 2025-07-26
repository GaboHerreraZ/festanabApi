import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken";
import {
  getInventory,
  addEditItem,
  getInventoryByName,
} from "./controller/inventory.controller";

const inventoryRouter: Router = Router();

inventoryRouter.get("/get-inventory", verifyToken, getInventory);
inventoryRouter.post("/add-edit-item", verifyToken, addEditItem);
inventoryRouter.get(
  "/get-inventory-by-name/:name",
  verifyToken,
  getInventoryByName
);

export default inventoryRouter;

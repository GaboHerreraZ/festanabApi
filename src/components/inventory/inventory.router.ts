import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken";
import { getInventory, addEditItem } from "./controller/inventory.controller";

const inventoryRouter: Router = Router();

inventoryRouter.get("/get-inventory", verifyToken, getInventory);
inventoryRouter.post("/add-edit-item", verifyToken, addEditItem);

export default inventoryRouter;

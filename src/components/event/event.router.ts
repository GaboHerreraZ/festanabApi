import { Router } from "express";
import { verifyToken } from "../../middleware/verifyToken";
import {
  getEvents,
  addEditEvent,
  getTotalsByEventId,
  getEventById,
} from "./controller/event.controller";
import {
  createSection,
  deleteItem,
  getEventDetail,
  upsertItem,
} from "./controller/event-edit.controller";
import {
  createOrUpdateBill,
  deleteBillById,
  getBillsByEvent,
} from "./controller/bills.controller";
import {
  addNewHour,
  deleteHourById,
  editHour,
  getHoursByEvent,
} from "./controller/hour.controller";

const eventRouter: Router = Router();

eventRouter.get("/get-events", verifyToken, getEvents);
eventRouter.get("/get-event-by-id/:id", verifyToken, getEventById);

eventRouter.post("/add-edit-event", verifyToken, addEditEvent);

eventRouter.get("/event-detail/:eventId", getEventDetail);
eventRouter.post("/event-detail/:eventId/section", verifyToken, createSection);
eventRouter.post(
  "/event-detail/:eventId/section/:sectionId/item",
  verifyToken,
  upsertItem
);
eventRouter.delete(
  "/event-detail/:eventId/section/:sectionId/item/:itemId",
  verifyToken,
  deleteItem
);

eventRouter.get("/get-bills/:eventId", verifyToken, getBillsByEvent);
eventRouter.post("/add-edit-bill", verifyToken, createOrUpdateBill);
eventRouter.delete("/delete-bill/:id", verifyToken, deleteBillById);

eventRouter.get(
  "/get-hours-by-event-id/:eventId",
  verifyToken,
  getHoursByEvent
);
eventRouter.post("/add-hour", verifyToken, addNewHour);
eventRouter.post("/edit-hour", verifyToken, editHour);
eventRouter.delete("/delete-hour/:id", verifyToken, deleteHourById);

eventRouter.get("/get-totals-by-event/:eventId", getTotalsByEventId);

export default eventRouter;

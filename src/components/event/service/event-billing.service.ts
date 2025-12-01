import mongoose from "mongoose";
import { EventBilling, IEventBilling } from "../model/event-billing.model";

const createEventBilling = async (data: IEventBilling) => {
  const bill = new EventBilling(data);
  return await bill.save();
};

const deleteEventBillingByEventId = async (eventId: string) => {
  return await EventBilling.findOneAndDelete({
    "event._id": eventId,
  });
};

const getEventBillingById = async (eventId: string) => {
  return await EventBilling.findOne({ "event._id": eventId });
};

export { createEventBilling, deleteEventBillingByEventId, getEventBillingById };

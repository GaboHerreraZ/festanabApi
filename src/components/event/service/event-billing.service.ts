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

const getEventBillingByEmployee = async (
  eventId: string,
  employeeId: string
) => {
  return EventBilling.aggregate([
    {
      $match: {
        "event._id": new mongoose.Types.ObjectId(eventId),
      },
    },
    {
      $addFields: {
        "event.billing": {
          $filter: {
            input: "$event.billing",
            as: "b",
            cond: {
              $eq: ["$$b.employeeId", new mongoose.Types.ObjectId(employeeId)],
            },
          },
        },
      },
    },
  ]);
};

export {
  createEventBilling,
  deleteEventBillingByEventId,
  getEventBillingById,
  getEventBillingByEmployee,
};

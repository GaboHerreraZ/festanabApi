import mongoose from "mongoose";
import { EventDetail } from "../model/event-detail.model";
import { IEvent, Event } from "../model/event.model";
import { Bill } from "../model/bill.model";
import { Hour } from "../model/hour.model";

const getEventId = async (eventId: string) => {
  return await Event.findById(eventId);
};

const getAllEvent = async () => {
  return await Event.find();
};

const addNewEvent = async (
  description: string,
  owner: string,
  date: Date,
  time: Date,
  location: string,
  nit: string
) => {
  const newEvent = new Event({
    description,
    owner,
    date,
    time,
    location,
    nit,
  });
  return await newEvent.save();
};

const updateEvent = async (event: IEvent) => {
  return await Event.findByIdAndUpdate(event._id, event, {
    new: true,
    runValidators: true,
  });
};

const getTotalsByEvent = async (eventId: string) => {
  const event = await Event.findById(eventId).lean();

  const detailTotals = await EventDetail.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    { $unwind: "$section" },
    { $unwind: "$section.items" },
    {
      $group: {
        _id: null,
        totalRentalPrice: { $sum: "$section.items.rentalPrice" },
        totalCostPrice: { $sum: "$section.items.costPrice" },
      },
    },
  ]);

  const rentalPrice = detailTotals[0]?.totalRentalPrice || 0;
  const costPrice = detailTotals[0]?.totalCostPrice || 0;

  const billTotals = await Bill.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: null,
        totalValue: { $sum: "$value" },
      },
    },
  ]);

  const billValue = billTotals[0]?.totalValue || 0;

  const hourTotals = await Hour.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: null,
        totalHoursValue: { $sum: "$total" },
      },
    },
  ]);

  const totalHours = hourTotals[0]?.totalHoursValue || 0;

  return {
    ...event,
    totalRentalPrice: rentalPrice,
    totalCostPrice: costPrice,
    totalBillValue: billValue,
    totalHourCost: totalHours,
  };
};

export { getAllEvent, addNewEvent, updateEvent, getTotalsByEvent, getEventId };

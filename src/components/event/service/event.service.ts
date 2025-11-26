import mongoose from "mongoose";
import { EventDetail } from "../model/event-detail.model";
import { IEvent, Event } from "../model/event.model";
import { Bill } from "../model/bill.model";
import { Hour } from "../model/hour.model";
import { CustomerQuote, ICustomerQuote } from "../model/customer-quote.model";

const getEventId = async (eventId: string) => {
  return await Event.findById(eventId);
};

const getAllEvent = async () => {
  return await Event.find().sort({ date: -1 });
};

const addNewEvent = async (
  description: string,
  owner: string,
  date: Date,
  time: Date,
  location: string,
  nit: string,
  customerId: string
) => {
  const newEvent = new Event({
    description,
    owner,
    date,
    time,
    location,
    nit,
    customerId,
  });
  return await newEvent.save();
};

const updateEvent = async (event: IEvent) => {
  return await Event.findByIdAndUpdate(event._id, event, {
    new: true,
    runValidators: true,
  });
};

const updateEventStatus = async (eventId: string, status: string) => {
  return await Event.findByIdAndUpdate(
    eventId,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );
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

const createCustomerQuotes = async (data: any) => {
  const newEventTotals = new CustomerQuote(data);
  return await newEventTotals.save();
};

const getAllCustomerQuotes = async (eventId: string) => {
  return await CustomerQuote.find({ eventId }).sort({ createdAt: -1 });
};

const deleteCustomerQuote = async (quoteId: string) => {
  return await CustomerQuote.findByIdAndDelete(quoteId);
};

const getCustomerQuoteById = async (quoteId: string) => {
  return await CustomerQuote.findById(quoteId);
};

export {
  getAllEvent,
  addNewEvent,
  updateEvent,
  updateEventStatus,
  getTotalsByEvent,
  getEventId,
  createCustomerQuotes,
  getAllCustomerQuotes,
  deleteCustomerQuote,
  getCustomerQuoteById,
};

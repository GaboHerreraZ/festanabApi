import mongoose, { Schema, Document } from "mongoose";

// ============================
// Interfaces (solo TypeScript)
// ============================
export interface IItem {
  _id?: string;
  name: string;
  description?: string;
  quantity: number;
  rentalPrice: number;
  costPrice: number;
  done: boolean;
  disabled: boolean;
  owner: string;
}

export interface ISection {
  _id?: string;
  name: string;
  description?: string;
  type: "admin" | "client" | string;
  items: IItem[];
}

export interface IDetail {
  eventId: mongoose.Types.ObjectId;
  section: ISection[];
}

export interface ICustomerQuote extends Document {
  eventId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  owner: string;
  description: string;
  nit: string;
  location: string;
  date: Date;
  time?: string | null;
  totalRentalPrice: number;
  totalCostPrice: number;
  totalBillValue: number;
  totalHourCost: number;
  utility: number;
  detail: IDetail;
  createdAt: Date;
}

const CustomerQuoteSchema = new Schema<ICustomerQuote>({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Event",
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  owner: { type: String, required: true },
  description: { type: String, required: true },
  nit: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: false },
  totalRentalPrice: { type: Number, required: true, default: 0 },
  totalCostPrice: { type: Number, required: true, default: 0 },
  totalBillValue: { type: Number, required: true, default: 0 },
  totalHourCost: { type: Number, required: true, default: 0 },
  utility: { type: Number, required: true, default: 0 },
  detail: {
    type: Object,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const CustomerQuote = mongoose.model<ICustomerQuote>(
  "CustomerQuote",
  CustomerQuoteSchema
);

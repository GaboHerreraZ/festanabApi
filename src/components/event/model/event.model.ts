import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  customerId: mongoose.Types.ObjectId;
  owner: string;
  description: string;
  location: string;
  status: string;
  nit: string;
  date: Date;
  time: Date;
}

const EventSchema: Schema<IEvent> = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  owner: { type: String, required: true },
  description: { type: String, required: true },
  nit: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: false },
  time: { type: Date, required: false, default: null },
  status: {
    type: String,
    required: true,
    enum: ["inQuote", "pending", "completed"],
    default: "inQuote",
  },
});

export const Event = mongoose.model<IEvent>("Event", EventSchema);

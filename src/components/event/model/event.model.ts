import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  name: string;
  owner: string;
  phoneNumber: number;
  description: string;
  location: string;
  nit: string;

  date: Date;
  time: Date;
}

const EventSchema: Schema<IEvent> = new Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  description: { type: String, required: true },
  nit: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: false },
  time: { type: Date, required: false },
});

export const Event = mongoose.model<IEvent>("Event", EventSchema);

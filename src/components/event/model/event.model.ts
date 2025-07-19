import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  name: string;
  owner: string;
  phoneNumber: number;
  description: string;
  date: Date;
  time: Date;
}

const EventSchema: Schema<IEvent> = new Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: Date, required: true },
});

export const Event = mongoose.model<IEvent>("Event", EventSchema);

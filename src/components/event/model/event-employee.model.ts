import mongoose, { Schema, Document } from "mongoose";

export interface IEventEmployee extends Document {
  eventId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  assignedAt: Date;
}

const EventEmployeeSchema: Schema<IEventEmployee> = new Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Event",
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Employee",
  },
  assignedAt: { type: Date, default: Date.now },
});

export const EventEmployee = mongoose.model<IEventEmployee>(
  "EventEmployee",
  EventEmployeeSchema
);

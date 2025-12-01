import mongoose, { Schema, Document } from "mongoose";

export interface IEmployeeService extends Document {
  eventId: mongoose.Types.ObjectId;
  date: Date;
  total: number;
  servicePrice: number;
  employeeId: mongoose.Types.ObjectId;
  employee: string;
  quantity: number;
  cc: string;
  observations: string;
  service: string;
  serviceId: mongoose.Types.ObjectId;
}

const EmployeeServiceSchema: Schema<IEmployeeService> = new Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Event",
  },
  date: { type: Date, required: true, default: Date.now },
  total: { type: Number, required: true, min: 0 },
  servicePrice: { type: Number, required: true, min: 0 },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Employee",
  },
  employee: { type: String, required: true },
  cc: { type: String, required: true },
  observations: { type: String, required: false },
  quantity: { type: Number, required: true, min: 1 },
  service: { type: String, required: true },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Service",
  },
});

export const EmployeeService = mongoose.model<IEmployeeService>(
  "EmployeeService",
  EmployeeServiceSchema
);

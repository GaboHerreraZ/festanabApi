import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  cc: number;
  hourPrice: number;
  active: boolean;
}

const EmployeeSchema: Schema<IEmployee> = new Schema({
  name: { type: String, required: true },
  cc: { type: Number, required: true, min: 0 },
  hourPrice: { type: Number, required: true, min: 0 },
  active: { type: Boolean, default: true },
});

export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);

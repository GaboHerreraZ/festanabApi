import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  service: string;
  price: number;
  description?: string;
}

const ServiceSchema: Schema<IService> = new Schema({
  service: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});

export const Service = mongoose.model<IService>("Service", ServiceSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  nit: string;
}

const CustomerSchema: Schema<ICustomer> = new Schema({
  name: { type: String, required: true },
  nit: { type: String, required: true },
});

export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);

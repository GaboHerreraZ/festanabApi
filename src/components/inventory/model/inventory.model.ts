import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  quantity: number;
  rentalPrice: number;
  description: string;
}

const ProductSchema: Schema<IProduct> = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  rentalPrice: { type: Number, required: true, min: 0 },
  description: { type: String, required: false, default: "" },
});

export const Product = mongoose.model<IProduct>("Product", ProductSchema);

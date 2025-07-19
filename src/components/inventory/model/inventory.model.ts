import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  quantity: number;
  rentalPrice: number;
}

const ProductSchema: Schema<IProduct> = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  rentalPrice: { type: Number, required: true, min: 0 },
});

export const Product = mongoose.model<IProduct>("Product", ProductSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  eventId: mongoose.Types.ObjectId;
  date: Date;
  name: string;
  value: number;
  paymentType: "Efectivo" | "Transferencia";
  paymentCompany: "Bancolombia" | "Nequi" | "Banco de Bogotá" | null;
  observations: string;
  conciliation: boolean;
  billType: string;
}

const BillSchema: Schema<IBill> = new Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Event",
  },
  name: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  value: { type: Number, required: true, min: 0 },
  paymentType: {
    type: String,
    required: true,
    enum: ["Efectivo", "Transferencia"],
  },
  paymentCompany: {
    type: String,
    enum: ["Bancolombia", "Nequi", "Banco de Bogotá", null],
    default: null,
  },
  observations: { type: String, required: false },
  conciliation: { type: Boolean, required: false, default: false },
  billType: { type: String, required: false },
});

export const Bill = mongoose.model<IBill>("Bill", BillSchema);

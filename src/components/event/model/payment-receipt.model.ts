import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentReceipt extends Document {
  eventId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  url: string;
  path: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

const PaymentReceiptSchema: Schema<IPaymentReceipt> = new Schema({
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
  url: { type: String, required: true },
  path: { type: String, required: true },
  fileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

PaymentReceiptSchema.index({ eventId: 1, employeeId: 1 }, { unique: true });

export const PaymentReceipt = mongoose.model<IPaymentReceipt>(
  "PaymentReceipt",
  PaymentReceiptSchema
);

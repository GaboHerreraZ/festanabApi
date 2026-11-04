import { PaymentReceipt } from "../model/payment-receipt.model";

type PaymentReceiptData = {
  url: string;
  path: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
};

const upsertPaymentReceipt = async (
  eventId: string,
  employeeId: string,
  data: PaymentReceiptData
) => {
  return await PaymentReceipt.findOneAndUpdate(
    { eventId, employeeId },
    { $set: { ...data, eventId, employeeId } },
    { new: true, upsert: true }
  );
};

const getPaymentReceipt = async (eventId: string, employeeId: string) => {
  return await PaymentReceipt.findOne({ eventId, employeeId });
};

const deletePaymentReceiptByEmployee = async (
  eventId: string,
  employeeId: string
) => {
  return await PaymentReceipt.findOneAndDelete({ eventId, employeeId });
};

const getPaymentReceiptsByEventId = async (eventId: string) => {
  return await PaymentReceipt.find({ eventId });
};

const deletePaymentReceiptsByEventId = async (eventId: string) => {
  return await PaymentReceipt.deleteMany({ eventId });
};

export {
  upsertPaymentReceipt,
  getPaymentReceipt,
  deletePaymentReceiptByEmployee,
  getPaymentReceiptsByEventId,
  deletePaymentReceiptsByEventId,
};

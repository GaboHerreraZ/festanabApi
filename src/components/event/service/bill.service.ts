import { Bill, IBill } from "../model/bill.model";

const createBill = async (data: IBill) => {
  const bill = new Bill(data);
  return await bill.save();
};

const getBillsByEventId = async (eventId: string) => {
  return await Bill.find({ eventId });
};

const updateBill = async (billId: string, updates: Partial<IBill>) => {
  return await Bill.findByIdAndUpdate(billId, updates, { new: true });
};

const deleteBill = async (billId: string) => {
  return await Bill.findByIdAndDelete(billId);
};

export { createBill, getBillsByEventId, updateBill, deleteBill };

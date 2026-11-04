import mongoose from "mongoose";
import { EventBilling, IEventBilling } from "../model/event-billing.model";
import { getPaymentReceiptsByEventId } from "./payment-receipt.service";

// El comprobante de pago vive en su propia colección y no dentro del snapshot
// de EventBilling, que setEventBilling borra y reconstruye en cada liquidación.
// Por eso se pega al leer. Se hace en memoria y no con un $lookup: es una
// consulta más, pero sin expresiones de agregación que puedan romperse en
// silencio (un $$variable mal escrito no falla, simplemente devuelve vacío).
const attachPaymentReceipts = async (eventId: string, billing: any[]) => {
  if (!billing.length) return billing;

  const receipts = await getPaymentReceiptsByEventId(eventId);

  if (!receipts.length) return billing;

  const byEmployee = new Map(
    receipts.map((receipt) => [String(receipt.employeeId), receipt])
  );

  // Sin comprobante la entrada se devuelve intacta, sin la llave paymentReceipt.
  return billing.map((entry) => {
    const receipt = byEmployee.get(String(entry.employeeId));
    return receipt ? { ...entry, paymentReceipt: receipt } : entry;
  });
};

const createEventBilling = async (data: IEventBilling) => {
  const bill = new EventBilling(data);
  return await bill.save();
};

const deleteEventBillingByEventId = async (eventId: string) => {
  return await EventBilling.findOneAndDelete({
    "event._id": eventId,
  });
};

const getEventBillingById = async (eventId: string) => {
  // .lean() es obligatorio: sobre un documento de Mongoose el schema no conoce
  // paymentReceipt y lo descartaría al serializar.
  const doc: any = await EventBilling.findOne({ "event._id": eventId }).lean();

  if (!doc) return null;

  doc.event.billing = await attachPaymentReceipts(
    eventId,
    doc.event.billing ?? []
  );

  return doc;
};

const getEventBillingByEmployee = async (
  eventId: string,
  employeeId: string
) => {
  const result = await EventBilling.aggregate([
    {
      $match: {
        "event._id": new mongoose.Types.ObjectId(eventId),
      },
    },
    {
      $addFields: {
        "event.billing": {
          $filter: {
            input: "$event.billing",
            as: "b",
            cond: {
              $eq: ["$$b.employeeId", new mongoose.Types.ObjectId(employeeId)],
            },
          },
        },
      },
    },
  ]);

  for (const doc of result) {
    doc.event.billing = await attachPaymentReceipts(
      eventId,
      doc.event.billing ?? []
    );
  }

  return result;
};

export {
  createEventBilling,
  deleteEventBillingByEventId,
  getEventBillingById,
  getEventBillingByEmployee,
};

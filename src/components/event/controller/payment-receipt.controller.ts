import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import {
  deletePaymentReceiptByEmployee,
  getPaymentReceipt,
  upsertPaymentReceipt,
} from "../service/payment-receipt.service";
import {
  buildReceiptPath,
  getReceiptPublicUrl,
  isAllowedReceiptMime,
  removeReceiptObjects,
  uploadReceiptObject,
} from "../service/payment-receipt-storage.service";
import { getEventBillingById } from "../service/event-billing.service";

const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;

const setPaymentReceipt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId, employeeId } = req.params;

    if (
      !Types.ObjectId.isValid(eventId) ||
      !Types.ObjectId.isValid(employeeId)
    ) {
      res.status(400).json({
        message: "eventId y employeeId deben ser identificadores válidos",
      });
      return;
    }

    const { fileName, mimeType, data } = req.body;

    if (
      typeof fileName !== "string" ||
      typeof mimeType !== "string" ||
      typeof data !== "string" ||
      !fileName ||
      !mimeType ||
      !data
    ) {
      res
        .status(400)
        .json({ message: "fileName, mimeType y data son requeridos" });
      return;
    }

    if (!isAllowedReceiptMime(mimeType)) {
      res
        .status(400)
        .json({ message: "Formato no permitido. Usa JPG, PNG, WEBP o PDF" });
      return;
    }

    const buffer = Buffer.from(data, "base64");

    if (!buffer.length) {
      res
        .status(400)
        .json({ message: "El archivo está vacío o el contenido es inválido" });
      return;
    }

    if (buffer.length > MAX_RECEIPT_BYTES) {
      res
        .status(400)
        .json({ message: "El archivo supera el límite de 3 MB" });
      return;
    }

    const billing: any = await getEventBillingById(eventId);

    const isSettled = (billing?.event?.billing ?? []).some(
      (entry: any) => String(entry.employeeId) === employeeId
    );

    if (!isSettled) {
      res.status(404).json({
        message: "No existe liquidación para ese empleado en el evento",
      });
      return;
    }

    const previous = await getPaymentReceipt(eventId, employeeId);
    const path = buildReceiptPath(eventId, employeeId, mimeType);

    await uploadReceiptObject(path, buffer, mimeType);

    const receipt = await upsertPaymentReceipt(eventId, employeeId, {
      url: getReceiptPublicUrl(path),
      path,
      fileName,
      mimeType,
      size: buffer.length,
      uploadedAt: new Date(),
    });

    if (previous?.path && previous.path !== path) {
      try {
        await removeReceiptObjects([previous.path]);
      } catch (error) {
        console.error("No se pudo borrar el comprobante anterior:", error);
      }
    }

    res.status(201).json({ data: receipt });
  } catch (error) {
    next(error);
  }
};

const removePaymentReceipt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId, employeeId } = req.params;

    if (
      !Types.ObjectId.isValid(eventId) ||
      !Types.ObjectId.isValid(employeeId)
    ) {
      res.status(400).json({
        message: "eventId y employeeId deben ser identificadores válidos",
      });
      return;
    }

    const receipt = await getPaymentReceipt(eventId, employeeId);

    if (!receipt) {
      res
        .status(404)
        .json({ message: "No existe comprobante para ese empleado" });
      return;
    }

    await removeReceiptObjects([receipt.path]);

    await deletePaymentReceiptByEmployee(eventId, employeeId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { setPaymentReceipt, removePaymentReceipt };

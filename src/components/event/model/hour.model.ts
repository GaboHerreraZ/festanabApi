import { de } from "date-fns/locale";
import mongoose, { Schema, Document } from "mongoose";

export interface IHour extends Document {
  eventId: mongoose.Types.ObjectId;
  employee: string;
  cc: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  hourPrice: number;

  hrsOrd: number;
  valHrsOrd: number;

  hrsExtDia: number;
  valExtDia: number;

  hrsNoc: number;
  valHrsNoc: number;

  hrsExtNoc: number;
  valExtNoc: number;

  hrsDomDia: number;
  valDomDia: number;

  hrsExtDomDia: number;
  valExtDomDia: number;

  hrsDomNoc: number;
  valDomNoc: number;

  hrsExtDomNoc: number;
  valExtDomNoc: number;

  auxiliaryTrasport: number;

  total: number;
}

const hourSchema: Schema = new Schema({
  eventId: { type: mongoose.Types.ObjectId, required: true, ref: "Event" },
  employee: { type: String, required: true },
  cc: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: false, default: null },
  hourPrice: { type: Number, required: true },

  hrsOrd: { type: Number, default: 0 },
  valHrsOrd: { type: Number, default: 0 },

  hrsExtDia: { type: Number, default: 0 },
  valExtDia: { type: Number, default: 0 },

  hrsNoc: { type: Number, default: 0 },
  valHrsNoc: { type: Number, default: 0 },

  hrsExtNoc: { type: Number, default: 0 },
  valExtNoc: { type: Number, default: 0 },

  hrsDomDia: { type: Number, default: 0 },
  valDomDia: { type: Number, default: 0 },

  hrsExtDomDia: { type: Number, default: 0 },
  valExtDomDia: { type: Number, default: 0 },

  hrsDomNoc: { type: Number, default: 0 },
  valDomNoc: { type: Number, default: 0 },

  hrsExtDomNoc: { type: Number, default: 0 },
  valExtDomNoc: { type: Number, default: 0 },
  auxiliaryTrasport: { type: Number, default: 0 },

  total: { type: Number, default: 0 },
});

export const Hour = mongoose.model<IHour>("Hour", hourSchema);

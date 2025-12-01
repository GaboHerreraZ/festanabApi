import mongoose, { Schema, Document } from "mongoose";

export interface IHourRecord {
  _id: mongoose.Types.ObjectId;
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

export interface IHourEmployee {
  _id: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  employee: string;
  cc: string;
  totalGeneral: number;
  records: IHourRecord[];
}

export interface IServiceRecord {
  _id: mongoose.Types.ObjectId;
  date: Date;
  total: number;
  servicePrice: number;
  observations: string;
  quantity: number;
  service: string;
  serviceId: mongoose.Types.ObjectId;
  employee: string;
  employeeId: mongoose.Types.ObjectId;

  cc: string;
}

export interface IEmployee {
  _id: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  employee: string;
  cc: string;
  totalGeneral: number;
  grandTotal: number;
  totalServices: number;
  totalHours: number;
  services: IServiceRecord[];
  hours: IHourRecord[];
}

export interface IEventBilling extends Document {
  event: {
    _id: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    owner: string;
    description: string;
    nit: string;
    location: string;
    date: Date;
    time: Date;
    status: string;
    billing: IEmployee[];
  };
}

const HourRecordSchema = new Schema<IHourRecord>({
  _id: mongoose.Types.ObjectId,
  date: Date,
  startTime: Date,
  endTime: Date,
  hourPrice: Number,
  hrsOrd: Number,
  valHrsOrd: Number,
  hrsExtDia: Number,
  valExtDia: Number,
  hrsNoc: Number,
  valHrsNoc: Number,
  hrsExtNoc: Number,
  valExtNoc: Number,
  hrsDomDia: Number,
  valDomDia: Number,
  hrsExtDomDia: Number,
  valExtDomDia: Number,
  hrsDomNoc: Number,
  valDomNoc: Number,
  hrsExtDomNoc: Number,
  valExtDomNoc: Number,
  auxiliaryTrasport: Number,
  total: Number,
});

const ServiceRecordSchema = new Schema<IServiceRecord>({
  _id: mongoose.Types.ObjectId,
  date: Date,
  total: Number,
  servicePrice: Number,
  observations: String,
  quantity: Number,
  service: String,
  serviceId: mongoose.Types.ObjectId,
  employee: String,
  employeeId: mongoose.Types.ObjectId,
  cc: String,
});

const EmployeeBillingSchema = new Schema<IEmployee>({
  _id: { type: Schema.Types.ObjectId, required: true },
  employeeId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Employee",
  },
  employee: String,
  cc: String,
  grandTotal: Number,
  totalServices: Number,
  totalHours: Number,
  hours: [HourRecordSchema],
  services: [ServiceRecordSchema],
});

const EventBillingSchema = new Schema<IEventBilling>({
  event: {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Event",
    },
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    owner: { type: String, required: true },
    description: { type: String, required: true },
    nit: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    status: { type: String, required: true },
    billing: [EmployeeBillingSchema],
  },
});

export const EventBilling = mongoose.model<IEventBilling>(
  "EventBilling",
  EventBillingSchema
);

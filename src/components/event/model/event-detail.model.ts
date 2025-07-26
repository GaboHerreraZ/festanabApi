import mongoose, { Schema, Document } from "mongoose";

export interface IEventDetail extends Document {
  eventId: mongoose.Types.ObjectId;
  section: {
    _id: mongoose.Types.ObjectId;
    name: string;
    type: "admin" | "client";
    description: string;
    items: {
      _id: mongoose.Types.ObjectId;
      name: string;
      rentalPrice: number;
      costPrice: number;
      owner: "Propio" | "Tercero";
    }[];
  }[];
}

const EventDetailSchema: Schema<IEventDetail> = new Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Event",
  },
  section: [
    {
      _id: { type: mongoose.Types.ObjectId, required: true },
      name: { type: String, required: true },
      description: { type: String, required: false, default: "" },
      type: { type: String, required: true, enum: ["admin", "client"] },
      items: [
        {
          _id: { type: mongoose.Types.ObjectId, required: true },
          name: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1, default: 1 },
          rentalPrice: { type: Number, required: true, min: 0 },
          costPrice: { type: Number, required: true, min: 0 },
          disabled: { type: Boolean, default: false },
          owner: {
            type: String,
            required: true,
            enum: ["Propio", "Tercero"],
          },
        },
      ],
    },
  ],
});

export const EventDetail = mongoose.model<IEventDetail>(
  "EventDetail",
  EventDetailSchema
);

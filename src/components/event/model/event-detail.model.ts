import mongoose, { Schema, Document } from "mongoose";

export interface IEventDetail extends Document {
  eventId: mongoose.Types.ObjectId;
  section: {
    _id: mongoose.Types.ObjectId;
    name: string;
    type: "admin" | "client";
    items: {
      _id: mongoose.Types.ObjectId;
      description: string;
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
      type: { type: String, required: true, enum: ["admin", "client"] },
      items: [
        {
          _id: { type: mongoose.Types.ObjectId, required: true },
          description: { type: String, required: true },
          rentalPrice: { type: Number, required: true, min: 0 },
          costPrice: { type: Number, required: true, min: 0 },
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

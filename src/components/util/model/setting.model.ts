import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  module: string;
}

const SettingSchema: Schema<ISetting> = new Schema({
  module: { type: String, required: true },
});

export const Setting = mongoose.model<ISetting>("Setting", SettingSchema);

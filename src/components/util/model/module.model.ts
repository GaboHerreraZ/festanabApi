import mongoose, { Schema, Document } from "mongoose";

export interface IModule extends Document {
  module: string;
}

const ModuleSchema: Schema<IModule> = new Schema({
  module: { type: String, required: true },
});

export const Module = mongoose.model<IModule>("Module", ModuleSchema);

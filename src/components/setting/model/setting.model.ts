import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  daytimeOvertimeHour: number; // Recargo Hora Extra Diurna
  regularNighttimeHour: number; // Hora Nocturna Ordinaria
  nighttimeOvertimeHour: number; // Hora Extra Nocturna
  sundayAndHolidayHour: number; // Hora Dominicales y Festivos
  daytimeOvertimeSundayHoliday: number; // Hora Extra Diurna Dominicales y Festivos
  nighttimeOvertimeSundayHoliday: number; // Hora Extra Nocturna Dominicales y Festivos
  nightWorkSundayHoliday: number; // Trabajo Nocturno Dominical o Festivo
  auxiliaryTrasport: number; // Auxilio de Transporte
}

const SettingSchema: Schema<ISetting> = new Schema({
  daytimeOvertimeHour: { type: Number, required: true, default: 0 },
  regularNighttimeHour: { type: Number, required: true, default: 0 },
  nighttimeOvertimeHour: { type: Number, required: true, default: 0 },
  sundayAndHolidayHour: { type: Number, required: true, default: 0 },
  daytimeOvertimeSundayHoliday: { type: Number, required: true, default: 0 },
  nighttimeOvertimeSundayHoliday: { type: Number, required: true, default: 0 },
  nightWorkSundayHoliday: { type: Number, required: true, default: 0 },
  auxiliaryTrasport: { type: Number, required: true, default: 0 },
});

export const Setting = mongoose.model<ISetting>("Setting", SettingSchema);

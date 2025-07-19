import { Hour, IHour } from "../model/hour.model";

const createHour = async (hour: IHour) => {
  return await Hour.create(hour);
};

const updateHour = async (hour: IHour) => {
  return await Hour.findByIdAndUpdate(hour._id, hour, { new: true });
};

const getEventHourById = async (eventId: string) => {
  return await Hour.find({ eventId });
};

const deleteHour = async (hourId: string) => {
  return await Hour.findByIdAndDelete(hourId);
};

export { createHour, updateHour, getEventHourById, deleteHour };

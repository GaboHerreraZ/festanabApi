import { Hour, IHour } from "../model/hour.model";

const createHour = async (hour: IHour) => {
  const gteDate = new Date(hour.date);
  gteDate.setHours(0, 0, 0, 0);

  const lteDate = new Date(hour.date);
  lteDate.setHours(23, 59, 59, 999);

  const exists = await Hour.findOne({
    employeeId: hour.employeeId,
    date: {
      $gte: gteDate,
      $lte: lteDate,
    },
  }).sort({ endTime: -1 });

  /*   if (exists) {
    if (new Date(hour.startTime) <= new Date(exists.endTime)) {
      throw new Error(
        `La hora de inicio debe ser mayor a la hora de fin de la última hora registrada en el dia ${exists.date.toLocaleDateString()}`
      );
    }

    hour.auxiliaryTrasport = 0;
  } */

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

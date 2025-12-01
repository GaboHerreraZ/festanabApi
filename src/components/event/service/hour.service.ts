import mongoose from "mongoose";
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

const deleteHourByEventId = async (eventId: string) => {
  return await Hour.deleteMany({ eventId });
};

async function getEmployeeWithRecords(eventId: string) {
  const id = new mongoose.Types.ObjectId(eventId);

  return await Hour.aggregate([
    // --- HORAS ---
    {
      $match: { eventId: id },
    },
    {
      $group: {
        _id: "$employeeId",
        employeeId: { $first: "$employeeId" },
        employee: { $first: "$employee" },
        cc: { $first: "$cc" },
        hours: {
          $push: "$$ROOT",
        },
        totalHours: { $sum: "$total" },
      },
    },

    // --- JUNTAR SERVICIOS ---
    {
      $lookup: {
        from: "employeeservices", // nombre de la colección
        let: { empId: "$employeeId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$eventId", id] },
                  { $eq: ["$employeeId", "$$empId"] },
                ],
              },
            },
          },
        ],
        as: "services",
      },
    },

    // Total de servicios
    {
      $addFields: {
        totalServices: { $sum: "$services.total" },
      },
    },

    // TOTAL GENERAL (Horas + Servicios)
    {
      $addFields: {
        grandTotal: { $add: ["$totalHours", "$totalServices"] },
      },
    },
  ]);

  /*   const result = await Hour.aggregate([
    { $match: { eventId: objectId } },

    {
      $group: {
        _id: "$employeeId",
        employeeId: { $first: "$employeeId" },
        employee: { $first: "$employee" },
        cc: { $first: "$cc" },
        totalGeneral: { $sum: "$total" },
        records: {
          $push: {
            _id: "$_id",
            date: "$date",
            startTime: "$startTime",
            endTime: "$endTime",
            hourPrice: "$hourPrice",
            hrsOrd: "$hrsOrd",
            valHrsOrd: "$valHrsOrd",
            hrsExtDia: "$hrsExtDia",
            valExtDia: "$valExtDia",
            hrsNoc: "$hrsNoc",
            valHrsNoc: "$valHrsNoc",
            hrsExtNoc: "$hrsExtNoc",
            valExtNoc: "$valExtNoc",
            hrsDomDia: "$hrsDomDia",
            valDomDia: "$valDomDia",
            hrsExtDomDia: "$hrsExtDomDia",
            valExtDomDia: "$valExtDomDia",
            hrsDomNoc: "$hrsDomNoc",
            valDomNoc: "$valDomNoc",
            hrsExtDomNoc: "$hrsExtDomNoc",
            valExtDomNoc: "$valExtDomNoc",
            auxiliaryTrasport: "$auxiliaryTrasport",
            total: "$total",
          },
        },
      },
    },
  ]);

  return result; */
}

export {
  createHour,
  updateHour,
  getEventHourById,
  deleteHour,
  deleteHourByEventId,
  getEmployeeWithRecords,
};

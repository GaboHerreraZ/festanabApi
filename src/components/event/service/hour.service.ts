import mongoose from "mongoose";
import { Hour, IHour } from "../model/hour.model";
import { Employee } from "../../employee/model/employee.model";

const createHour = async (hour: IHour) => {
  return await Hour.create(hour);
};

const updateHour = async (hour: IHour) => {
  return await Hour.findByIdAndUpdate(hour._id, hour, { new: true });
};

const findOverlappingHour = async (params: {
  eventId: string | mongoose.Types.ObjectId;
  employeeId: string | mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  excludeId?: string | mongoose.Types.ObjectId;
}) => {
  const { eventId, employeeId, startTime, endTime, excludeId } = params;

  const query: any = {
    eventId,
    employeeId,
    endTime: { $ne: null, $gt: startTime },
    startTime: { $lt: endTime },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await Hour.findOne(query);
};

const getEmployeeEventsByCc = async (cc: string) => {
  const ccNumber = Number(cc);

  return await Employee.aggregate([
    { $match: { cc: ccNumber } },
    {
      $lookup: {
        from: "eventemployees",
        localField: "_id",
        foreignField: "employeeId",
        as: "assignments",
      },
    },
    { $unwind: "$assignments" },
    {
      $lookup: {
        from: "events",
        localField: "assignments.eventId",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: { path: "$event", preserveNullAndEmptyArrays: false } },
    { $match: { "event.status": "approved" } },
    {
      $lookup: {
        from: "hours",
        let: { eventId: "$event._id", employeeId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$eventId", "$$eventId"] },
                  { $eq: ["$employeeId", "$$employeeId"] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              startTime: 1,
              endTime: 1,
              approved: 1,
              approvedAt: 1,
              observations: 1,
            },
          },
        ],
        as: "hours",
      },
    },
    {
      $project: {
        _id: 0,
        eventId: "$event._id",
        employeeId: "$_id",
        employee: "$name",
        cc: "$cc",
        hourPrice: "$hourPrice",
        owner: "$event.owner",
        description: "$event.description",
        location: "$event.location",
        date: "$event.date",
        status: "$event.status",
        assignedAt: "$assignments.assignedAt",
        hours: 1,
      },
    },
  ]);
};

const getEventHourById = async (eventId: string) => {
  const id = new mongoose.Types.ObjectId(eventId);

  return await Hour.aggregate([
    { $match: { eventId: id } },
    {
      $group: {
        _id: "$employeeId",
        employeeId: { $first: "$employeeId" },
        employee: { $first: "$employee" },
        cc: { $first: "$cc" },
        horas: { $push: "$$ROOT" },
      },
    },
  ]);
};

const deleteHour = async (hourId: string) => {
  return await Hour.findByIdAndDelete(hourId);
};

const setHourApproval = async (
  hourId: string,
  approved: boolean,
  userId: string,
  observations: string | null
) => {
  const trimmed = observations?.trim() || null;
  const finalObservations =
    approved && !trimmed ? "Horas aprobadas" : trimmed;

  return await Hour.findByIdAndUpdate(
    hourId,
    {
      approved,
      approvedBy: userId,
      approvedAt: new Date(),
      observations: finalObservations,
    },
    { new: true }
  );
};

const deleteHourByEventId = async (eventId: string) => {
  return await Hour.deleteMany({ eventId });
};

async function getEmployeeWithRecords(eventId: string) {
  const id = new mongoose.Types.ObjectId(eventId);

  return await Hour.aggregate([
    // Empleados con horas
    {
      $match: { eventId: id },
    },
    {
      $group: {
        _id: "$employeeId",
        employeeId: { $first: "$employeeId" },
        employee: { $first: "$employee" },
        cc: { $first: "$cc" },
      },
    },

    // Unir empleados que solo tienen servicios (sin horas)
    {
      $unionWith: {
        coll: "employeeservices",
        pipeline: [
          { $match: { eventId: id } },
          {
            $group: {
              _id: "$employeeId",
              employeeId: { $first: "$employeeId" },
              employee: { $first: "$employee" },
              cc: { $first: "$cc" },
            },
          },
        ],
      },
    },

    // Agrupar para obtener empleados únicos
    {
      $group: {
        _id: "$employeeId",
        employeeId: { $first: "$employeeId" },
        employee: { $first: "$employee" },
        cc: { $first: "$cc" },
      },
    },

    // --- JUNTAR HORAS ---
    {
      $lookup: {
        from: "hours",
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
        as: "hours",
      },
    },
    {
      $addFields: {
        totalHours: { $sum: "$hours.total" },
      },
    },

    // --- JUNTAR SERVICIOS ---
    {
      $lookup: {
        from: "employeeservices",
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
  setHourApproval,
  getEmployeeEventsByCc,
  findOverlappingHour,
};

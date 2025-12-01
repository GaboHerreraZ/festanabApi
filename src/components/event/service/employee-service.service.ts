import mongoose from "mongoose";
import {
  EmployeeService,
  IEmployeeService,
} from "../model/employee-service.model";

const createEmployeeService = async (employeeService: IEmployeeService) => {
  return await EmployeeService.create(employeeService);
};

const updateEmployeeService = async (employeeService: IEmployeeService) => {
  return await EmployeeService.findByIdAndUpdate(
    employeeService._id,
    employeeService,
    { new: true }
  );
};

const getEventEmployeeServiceById = async (eventId: string) => {
  return await EmployeeService.find({ eventId });
};

const deleteEmployeeService = async (employeeServiceId: string) => {
  return await EmployeeService.findByIdAndDelete(employeeServiceId);
};

const deleteEmployeeServiceByEventId = async (eventId: string) => {
  return await EmployeeService.deleteMany({ eventId });
};

async function getTotalEmployeeServices(eventId: string) {
  const objectId = new mongoose.Types.ObjectId(eventId);

  const result = await EmployeeService.aggregate([
    { $match: { eventId: objectId } },

    {
      $group: {
        _id: "$employeeId",
        employeeId: { $first: "$employeeId" },
        employee: { $first: "$employee" },
        cc: { $first: "$cc" },
        services: {
          $push: {
            _id: "$_id",
            date: "$date",
            total: "$total",
            servicePrice: "$servicePrice",
            observations: "$observations",
            quantity: "$quantity",
            service: "$service",
            serviceId: "$serviceId",
          },
        },
        totalGeneral: { $sum: "$total" },
      },
    },
  ]);

  return result;
}

export {
  createEmployeeService,
  updateEmployeeService,
  getEventEmployeeServiceById,
  deleteEmployeeServiceByEventId,
  deleteEmployeeService,
  getTotalEmployeeServices,
};

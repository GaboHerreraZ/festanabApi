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

export {
  createEmployeeService,
  updateEmployeeService,
  getEventEmployeeServiceById,
  deleteEmployeeServiceByEventId,
  deleteEmployeeService,
};

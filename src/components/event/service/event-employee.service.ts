import { EventEmployee, IEventEmployee } from "../model/event-employee.model";
import { Hour } from "../model/hour.model";

const assignEmployeeToEvent = async (data: Partial<IEventEmployee>) => {
  return await EventEmployee.create(data);
};

const getEmployeesByEventId = async (eventId: string) => {
  return await EventEmployee.find({ eventId }).populate("employeeId");
};

const deleteEventEmployeeById = async (id: string) => {
  const assignment = await EventEmployee.findById(id);

  if (!assignment) return null;

  const hoursDeleted = await Hour.deleteMany({
    eventId: assignment.eventId,
    employeeId: assignment.employeeId,
  });

  await EventEmployee.findByIdAndDelete(id);

  return { assignment, hoursDeleted: hoursDeleted.deletedCount };
};

export {
  assignEmployeeToEvent,
  getEmployeesByEventId,
  deleteEventEmployeeById,
};

import { Employee, IEmployee } from "../model/employee.model";

const getAllEmployees = async () => {
  return await Employee.find();
};

const addNewEmployee = async (name: string, cc: number, hourPrice: number) => {
  const newEmployee = new Employee({ name, cc, hourPrice });
  return await newEmployee.save();
};

const updateEmployee = async (employee: IEmployee) => {
  return await Employee.findByIdAndUpdate(employee._id, employee, {
    new: true,
    runValidators: true,
  });
};

export { getAllEmployees, addNewEmployee, updateEmployee };

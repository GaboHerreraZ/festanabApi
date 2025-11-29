import { Customer, ICustomer } from "../model/customer.model";

const getAllCustomers = async () => {
  return await Customer.find();
};

const addNewCustomer = async (name: string, nit: string) => {
  const newCustomer = new Customer({ name, nit });
  return await newCustomer.save();
};

const updateCustomer = async (customer: ICustomer) => {
  return await Customer.findByIdAndUpdate(customer._id, customer, {
    new: true,
    runValidators: true,
  });
};

const findCustomerByName = async (query: string) => {
  const regex = new RegExp(query, "i");
  return await Customer.find({ name: { $regex: regex } })
    .lean()
    .exec();
};

const deleteCustomer = async (customerId: string) => {
  return await Customer.findByIdAndDelete(customerId);
};

export {
  addNewCustomer,
  updateCustomer,
  getAllCustomers,
  findCustomerByName,
  deleteCustomer,
};

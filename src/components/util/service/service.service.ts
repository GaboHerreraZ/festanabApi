import { IService, Service } from "../model/service.model";

const getAllServices = async () => {
  return await Service.find();
};

const addNewService = async (
  service: string,
  price: number,
  description: string
) => {
  const newService = new Service({ service, price, description });
  return await newService.save();
};

const updateService = async (service: IService) => {
  return await Service.findByIdAndUpdate(service._id, service, {
    new: true,
    runValidators: true,
  });
};

const deleteService = async (serviceId: string) => {
  return await Service.findByIdAndDelete(serviceId);
};

export { getAllServices, updateService, addNewService, deleteService };

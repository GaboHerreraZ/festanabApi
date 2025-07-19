import { IModule, Module } from "../model/module.model";

const getAllModules = async () => {
  return await Module.find();
};

const addNewModule = async (module: string) => {
  const newModule = new Module({ module });
  return await newModule.save();
};

const updateModule = async (module: IModule) => {
  return await Module.findByIdAndUpdate(module._id, module, {
    new: true,
    runValidators: true,
  });
};

export { getAllModules, updateModule, addNewModule };

import { ISetting, Setting } from "../model/setting.model";

const getSetting = async () => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({}); // Se crean con valores por defecto
  }
  return setting;
};

const updateSetting = async (setting: ISetting) => {
  return await Setting.findByIdAndUpdate(setting._id, setting, {
    new: true,
    runValidators: true,
  });
};

export { getSetting, updateSetting };

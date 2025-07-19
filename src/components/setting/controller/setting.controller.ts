import { Request, Response, NextFunction } from "express";
import { getSetting, updateSetting } from "../service/setting.service";
import { ISetting } from "../model/setting.model";

const getAppSetting = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await getSetting();
    res.status(200).json({ data: setting });
  } catch (error) {
    next(error);
  }
};

const updateAppSetting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settingData = req.body as ISetting;

    if (!settingData._id) {
      res.status(400).json({ error: "Missing setting ID" });
      return;
    }

    const updated = await updateSetting(settingData);

    res.status(200).json({ data: updated });
  } catch (error) {
    next(error);
  }
};

export { getAppSetting, updateAppSetting };

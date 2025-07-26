import { NextFunction, Request, Response } from "express";
import {
  addItemToSection,
  addSection,
  checkSectionExists,
  deleteItemFromSection,
  editItemInSection,
  getEventDetailByEventId,
  editSectionDescription,
  updateAiuSection,
} from "../service/event-detail.service";
import mongoose from "mongoose";

const getEventDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;

    const detail = await getEventDetailByEventId(eventId);

    res.status(200).json({ data: detail });
  } catch (error) {
    next(error);
  }
};

const updateAiuEventSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sectionId, items } = req.body;

    await updateAiuSection(sectionId, items);

    res.status(201).json({ data: true });
  } catch (error) {
    next(error);
  }
};

const createSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;
    const { name } = req.body;

    const sectionExists = await checkSectionExists(eventId, name);

    if (sectionExists) {
      res.status(400).json({ message: "Section already exists" });
      return;
    }

    const updatedEvent = await addSection(eventId, name);

    res.status(201).json({ data: updatedEvent });
  } catch (error) {
    next(error);
  }
};

const editSectionDescriptionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sectionId, eventId, description } = req.body;

    await editSectionDescription(eventId, sectionId, description);

    res.status(200).json({ data: true });
  } catch (error) {
    next(error);
  }
};

const upsertItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, sectionId } = req.params;
    const { _id, rentalPrice, owner, costPrice, name, quantity } = req.body;

    let item = {
      _id: _id ? _id : new mongoose.Types.ObjectId(),
      rentalPrice,
      owner,
      quantity,
      costPrice,
      name,
    };

    if (_id && _id.trim() !== "") {
      await editItemInSection(eventId, sectionId, _id, { ...item });
    } else {
      await addItemToSection(eventId, sectionId, { ...item });
    }

    res.status(200).json({ data: item });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, sectionId, itemId } = req.params;

    await deleteItemFromSection(eventId, sectionId, itemId);

    res.status(200).json({ data: itemId });
  } catch (error) {
    next(error);
  }
};

export {
  getEventDetail,
  createSection,
  upsertItem,
  deleteItem,
  editSectionDescriptionById,
  updateAiuEventSection,
};

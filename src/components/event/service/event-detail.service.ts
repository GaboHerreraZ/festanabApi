import mongoose from "mongoose";
import { EventDetail, IEventDetail } from "../model/event-detail.model";

const getEventDetailByEventId = async (eventId: string) => {
  let eventDetail = await EventDetail.findOne({ eventId });

  if (!eventDetail) {
    eventDetail = new EventDetail({
      eventId,
      section: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Logistica",
          type: "admin",
          items: [
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Transporte",
              rentalPrice: 0,
              costPrice: 0,
              owner: "Propio",
            },
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Materiales",
              rentalPrice: 0,
              costPrice: 0,
              owner: "Propio",
            },
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Alimentación",
              rentalPrice: 0,
              costPrice: 0,
              owner: "Propio",
            },
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Mano de obra",
              rentalPrice: 0,
              costPrice: 0,
              owner: "Propio",
            },
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Diseño",
              rentalPrice: 0,
              costPrice: 0,
              owner: "Propio",
            },
          ],
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Administración , Imprevistos y Utilidad",
          type: "admin",
          items: [
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Utilidad",
              quantity: 1,
              rentalPrice: 0,
              costPrice: 0,
              owner: "Propio",
              disabled: false,
            },
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Administración",
              quantity: 1,
              rentalPrice: 0,
              costPrice: 0,
              owner: "Propio",
              disabled: false,
            },
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Imprevistos",
              quantity: 1,
              rentalPrice: 0,
              costPrice: 0,
              owner: "Propio",
              disabled: false,
            },
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Contabilidad",
              quantity: 1,
              rentalPrice: 0,
              costPrice: 0,
              owner: "Propio",
              disabled: false,
            },
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Gestión",
              quantity: 1,
              rentalPrice: 0,
              costPrice: 0,
              owner: "Propio",
              disabled: false,
            },
          ],
        },
      ],
    });
    await eventDetail.save();
  }

  return eventDetail;
};

const addNewEventDetail = async (event: IEventDetail) => {
  const newEventDetail = new EventDetail(event);
  await newEventDetail.save();
  return newEventDetail;
};

const addSection = async (eventId: string, sectionName: string) => {
  const newSection = {
    _id: new mongoose.Types.ObjectId(),
    name: sectionName,
    description: "",
    type: "client",
    items: [],
  };

  await EventDetail.findOneAndUpdate(
    { eventId },
    { $push: { section: newSection } }
  );

  return newSection;
};

const deleteSection = async (eventId: string, sectionId: string) => {
  const result = await EventDetail.updateOne(
    { eventId: new mongoose.Types.ObjectId(eventId) },
    {
      $pull: {
        section: { _id: new mongoose.Types.ObjectId(sectionId) },
      },
    }
  );

  return result;
};

const editSectionDescription = async (
  eventId: string,
  sectionId: string,
  description: string
) => {
  const eventDetail = await EventDetail.findOneAndUpdate(
    {
      eventId,
      "section._id": new mongoose.Types.ObjectId(sectionId),
    },
    {
      $set: {
        "section.$.description": description,
      },
    },
    { new: true }
  );

  return eventDetail;
};

const checkSectionExists = async (eventId: string, name: string) => {
  const exists = await EventDetail.aggregate([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
    { $unwind: "$section" },
    {
      $match: {
        "section.name": {
          $regex: `^${name.trim()}$`,
          $options: "i",
        },
      },
    },
    { $limit: 1 },
  ]);

  return exists.length > 0;
};

const addItemToSection = async (
  eventId: string,
  sectionId: string,
  item: {
    _id: mongoose.Types.ObjectId;
    rentalPrice?: number;
    quantity?: number;
    costPrice?: number;
    description?: string;
    owner?: "Propio" | "Tercero";
    done?: boolean;
  }
) => {
  await EventDetail.findOneAndUpdate(
    { eventId, "section._id": new mongoose.Types.ObjectId(sectionId) },
    {
      $push: {
        "section.$.items": {
          ...item,
        },
      },
    }
  );

  return item;
};

const editItemInSection = async (
  eventId: string,
  sectionId: string,
  itemId: string,
  updatedItem: {
    name?: string;
    rentalPrice?: number;
    quantity?: number;
    description?: string;
    costPrice?: number;
    owner?: "Propio" | "Tercero";
    done?: boolean;
  }
) => {
  const eventDetail = await EventDetail.findOneAndUpdate(
    {
      eventId,
      "section._id": new mongoose.Types.ObjectId(sectionId),
      "section.items._id": new mongoose.Types.ObjectId(itemId),
    },
    {
      $set: {
        "section.$[sectionElem].items.$[itemElem].name": updatedItem.name,
        "section.$[sectionElem].items.$[itemElem].rentalPrice":
          updatedItem.rentalPrice,
        "section.$[sectionElem].items.$[itemElem].costPrice":
          updatedItem.costPrice,
        "section.$[sectionElem].items.$[itemElem].description":
          updatedItem.description,
        "section.$[sectionElem].items.$[itemElem].quantity":
          updatedItem.quantity,
        "section.$[sectionElem].items.$[itemElem].owner": updatedItem.owner,
        "section.$[sectionElem].items.$[itemElem].done": updatedItem.done,
      },
    },
    {
      arrayFilters: [
        { "sectionElem._id": new mongoose.Types.ObjectId(sectionId) },
        { "itemElem._id": new mongoose.Types.ObjectId(itemId) },
      ],
      new: true,
    }
  );

  return eventDetail;
};

const deleteItemFromSection = async (
  eventId: string,
  sectionId: string,
  itemId: string
) => {
  const eventDetail = await EventDetail.findOneAndUpdate(
    {
      eventId,
      "section._id": new mongoose.Types.ObjectId(sectionId),
    },
    {
      $pull: {
        "section.$.items": { _id: new mongoose.Types.ObjectId(itemId) },
      },
    },
    { new: true }
  );

  return eventDetail;
};

const updateAiuSection = async (sectionId: string, items: any[]) => {
  const eventDetail = await EventDetail.findOneAndUpdate(
    { "section._id": new mongoose.Types.ObjectId(sectionId) },
    { $set: { "section.$.items": items } },
    { new: true }
  );

  return eventDetail;
};

export {
  getEventDetailByEventId,
  addSection,
  addItemToSection,
  checkSectionExists,
  editItemInSection,
  deleteItemFromSection,
  editSectionDescription,
  updateAiuSection,
  deleteSection,
  addNewEventDetail,
};

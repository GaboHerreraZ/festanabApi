import { NextFunction, Request, Response } from "express";
import {
  getCards,
  getMonthlyEvents,
  getMonthlyUtility,
  getMonthlyHours,
} from "../service/dashboard.service";

const parseYear = (req: Request) =>
  req.query.year ? Number(req.query.year) : new Date().getFullYear();

const parseMonth = (req: Request) =>
  req.query.month !== undefined
    ? Number(req.query.month)
    : new Date().getMonth();

const dashboardCards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getCards(parseYear(req), parseMonth(req));
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

const dashboardMonthlyEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getMonthlyEvents(parseYear(req));
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

const dashboardMonthlyUtility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getMonthlyUtility(parseYear(req));
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

const dashboardMonthlyHours = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getMonthlyHours(parseYear(req));
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export {
  dashboardCards,
  dashboardMonthlyEvents,
  dashboardMonthlyUtility,
  dashboardMonthlyHours,
};

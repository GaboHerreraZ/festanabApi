import { Event } from "../model/event.model";
import { EventDetail } from "../model/event-detail.model";
import { Bill } from "../model/bill.model";
import { Hour } from "../model/hour.model";

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const STATUS_LABELS: Record<string, string> = {
  inQuote: "En cotización",
  approved: "Aprobados",
  pending: "Pendientes",
  completed: "Finalizados",
};

const STATUS_COLORS: Record<string, string> = {
  inQuote: "#FFB74D",
  approved: "#64B5F6",
  pending: "#BA68C8",
  completed: "#81C784",
};

const STATUS_KEYS = Object.keys(STATUS_LABELS);

const getMonthRange = (year: number, month: number) => ({
  start: new Date(year, month, 1, 0, 0, 0, 0),
  end: new Date(year, month + 1, 1, 0, 0, 0, 0),
});

const getYearRange = (year: number) => ({
  start: new Date(year, 0, 1, 0, 0, 0, 0),
  end: new Date(year + 1, 0, 1, 0, 0, 0, 0),
});

const emptyMonthly = () => Array(12).fill(0);

const getCards = async (year: number, month: number) => {
  const { start, end } = getMonthRange(year, month);

  const [statusCounts, rentalAgg, billAgg, hourAgg] = await Promise.all([
    Event.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    EventDetail.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
          pipeline: [
            { $match: { date: { $gte: start, $lt: end } } },
            { $project: { _id: 1 } },
          ],
        },
      },
      { $unwind: "$event" },
      { $unwind: "$section" },
      { $unwind: "$section.items" },
      {
        $group: {
          _id: null,
          totalRental: { $sum: "$section.items.rentalPrice" },
        },
      },
    ]),

    Bill.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
          pipeline: [
            { $match: { date: { $gte: start, $lt: end } } },
            { $project: { _id: 1 } },
          ],
        },
      },
      { $unwind: "$event" },
      { $group: { _id: null, totalBills: { $sum: "$value" } } },
    ]),

    Hour.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: null,
          totalHours: {
            $sum: {
              $add: [
                "$hrsOrd",
                "$hrsExtDia",
                "$hrsNoc",
                "$hrsExtNoc",
                "$hrsDomDia",
                "$hrsExtDomDia",
                "$hrsDomNoc",
                "$hrsExtDomNoc",
              ],
            },
          },
          totalHourCost: { $sum: "$total" },
        },
      },
    ]),
  ]);

  const statusMap: Record<string, number> = {};
  STATUS_KEYS.forEach((k) => (statusMap[k] = 0));
  statusCounts.forEach((c: any) => {
    if (statusMap[c._id] !== undefined) statusMap[c._id] = c.count;
  });

  const totalEvents = STATUS_KEYS.reduce((acc, k) => acc + statusMap[k], 0);
  const totalRevenue = rentalAgg[0]?.totalRental || 0;
  const totalBills = billAgg[0]?.totalBills || 0;
  const totalHoursWorked =
    Math.round((hourAgg[0]?.totalHours || 0) * 100) / 100;
  const totalHourCost = hourAgg[0]?.totalHourCost || 0;
  const totalCost = totalBills + totalHourCost;
  const totalUtility = totalRevenue - totalCost;

  return {
    period: { year, month, monthLabel: MONTH_LABELS[month], start, end },
    totalEvents,
    eventsInQuote: statusMap["inQuote"],
    eventsApproved: statusMap["approved"],
    eventsCompleted: statusMap["completed"],
    eventsPending: statusMap["pending"],
    totalHoursWorked,
    totalHourCost,
    totalRevenue,
    totalCost,
    totalUtility,
  };
};

const getMonthlyEvents = async (year: number) => {
  const { start, end } = getYearRange(year);

  const grouped = await Event.aggregate([
    { $match: { date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { month: { $month: "$date" }, status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  const series: Record<string, number[]> = {};
  STATUS_KEYS.forEach((k) => (series[k] = emptyMonthly()));

  grouped.forEach((g: any) => {
    const status = g._id.status;
    const idx = g._id.month - 1;
    if (series[status]) series[status][idx] = g.count;
  });

  return {
    labels: MONTH_LABELS,
    datasets: STATUS_KEYS.map((key) => ({
      label: STATUS_LABELS[key],
      backgroundColor: STATUS_COLORS[key],
      borderColor: STATUS_COLORS[key],
      data: series[key],
    })),
  };
};

const getMonthlyUtility = async (year: number) => {
  const { start, end } = getYearRange(year);

  const [rentalByMonth, billsByMonth, hoursByMonth] = await Promise.all([
    EventDetail.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
          pipeline: [
            { $match: { date: { $gte: start, $lt: end } } },
            { $project: { date: 1 } },
          ],
        },
      },
      { $unwind: "$event" },
      { $unwind: "$section" },
      { $unwind: "$section.items" },
      {
        $group: {
          _id: { $month: "$event.date" },
          totalRental: { $sum: "$section.items.rentalPrice" },
        },
      },
    ]),

    Bill.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
          pipeline: [
            { $match: { date: { $gte: start, $lt: end } } },
            { $project: { date: 1 } },
          ],
        },
      },
      { $unwind: "$event" },
      {
        $group: {
          _id: { $month: "$event.date" },
          totalBills: { $sum: "$value" },
        },
      },
    ]),

    Hour.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $month: "$date" },
          totalHourCost: { $sum: "$total" },
        },
      },
    ]),
  ]);

  const revenues = emptyMonthly();
  const bills = emptyMonthly();
  const hourCosts = emptyMonthly();

  rentalByMonth.forEach((g: any) => (revenues[g._id - 1] = g.totalRental || 0));
  billsByMonth.forEach((g: any) => (bills[g._id - 1] = g.totalBills || 0));
  hoursByMonth.forEach(
    (g: any) => (hourCosts[g._id - 1] = g.totalHourCost || 0)
  );

  const costs = bills.map((b, i) => b + hourCosts[i]);
  const utilities = revenues.map((r, i) => r - costs[i]);

  return {
    labels: MONTH_LABELS,
    datasets: [
      {
        type: "bar",
        label: "Ingresos",
        backgroundColor: "#42A5F5",
        data: revenues,
      },
      {
        type: "bar",
        label: "Costos",
        backgroundColor: "#EF5350",
        data: costs,
      },
      {
        type: "line",
        label: "Utilidad",
        borderColor: "#66BB6A",
        backgroundColor: "#66BB6A",
        fill: false,
        tension: 0.4,
        data: utilities,
      },
    ],
  };
};

const getMonthlyHours = async (year: number) => {
  const { start, end } = getYearRange(year);

  const grouped = await Hour.aggregate([
    { $match: { date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { $month: "$date" },
        totalHours: {
          $sum: {
            $add: [
              "$hrsOrd",
              "$hrsExtDia",
              "$hrsNoc",
              "$hrsExtNoc",
              "$hrsDomDia",
              "$hrsExtDomDia",
              "$hrsDomNoc",
              "$hrsExtDomNoc",
            ],
          },
        },
      },
    },
  ]);

  const hours = emptyMonthly();
  grouped.forEach((g: any) => {
    hours[g._id - 1] = Math.round((g.totalHours || 0) * 100) / 100;
  });

  return {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: "Horas trabajadas",
        backgroundColor: "#7E57C2",
        borderColor: "#7E57C2",
        data: hours,
      },
    ],
  };
};

export { getCards, getMonthlyEvents, getMonthlyUtility, getMonthlyHours };

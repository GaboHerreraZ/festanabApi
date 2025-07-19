export const holidayInColombia = async (date: Date): Promise<boolean> => {
  const year = date.getFullYear();
  const dateStr = date.toISOString().slice(0, 10); // 'YYYY-MM-DD'

  const response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/CO`
  );
  if (!response.ok)
    throw new Error("Failed to fetch holidays from Nager.Date API");

  const holidays = await response.json();

  return holidays.some((h: any) => h.date === dateStr);
};

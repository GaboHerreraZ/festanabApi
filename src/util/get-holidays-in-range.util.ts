const holidayCache = new Map<number, Set<string>>();

const fetchHolidaysForYear = async (year: number): Promise<Set<string>> => {
  if (holidayCache.has(year)) return holidayCache.get(year)!;

  const response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/CO`
  );
  if (!response.ok)
    throw new Error("Failed to fetch holidays from Nager.Date API");

  const holidays = await response.json();
  const set = new Set<string>(holidays.map((h: any) => h.date));
  holidayCache.set(year, set);
  return set;
};

export const getHolidaysInRange = async (
  dateStrings: string[]
): Promise<Set<string>> => {
  const years = new Set<number>();
  for (const ds of dateStrings) {
    years.add(Number(ds.slice(0, 4)));
  }

  const result = new Set<string>();
  for (const year of years) {
    const yearHolidays = await fetchHolidaysForYear(year);
    for (const ds of dateStrings) {
      if (yearHolidays.has(ds)) result.add(ds);
    }
  }

  return result;
};

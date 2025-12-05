export const getHourNumber = (time: string) => {
  const date = new Date(time);

  const formatter = new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  });

  const parts = formatter.formatToParts(date);

  const hours = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minutes = Number(parts.find((p) => p.type === "minute")?.value || 0);

  return hours + minutes / 60;
};

export const getHourNumber = (time: string) => {
  const hour = new Date(time);

  // Obtener horas y minutos locales
  const horas = hour.getHours();
  const minutos = hour.getMinutes();

  // Convertir minutos a parte decimal
  return horas + minutos / 60;
};

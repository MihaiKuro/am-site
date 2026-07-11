export const APPOINTMENT_TIMEZONE = "Europe/Bucharest";

export const formatSlotTime = (date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: APPOINTMENT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(date));

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
};

export const getCalendarDateInTimezone = (date, timeZone = APPOINTMENT_TIMEZONE) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));

export const getDaySearchBounds = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return {
    searchStart: new Date(Date.UTC(year, month - 1, day - 1, 0, 0, 0, 0)),
    searchEnd: new Date(Date.UTC(year, month - 1, day + 1, 23, 59, 59, 999)),
    dateStr,
  };
};

export const findConflictingAppointment = (appointments, calendarDay, slotTime) =>
  appointments.find(
    (appointment) =>
      getCalendarDateInTimezone(appointment.date) === calendarDay &&
      formatSlotTime(appointment.date) === slotTime
  );

export const getReservedSlotTimes = (appointments, calendarDay) =>
  [
    ...new Set(
      appointments
        .filter((appointment) => getCalendarDateInTimezone(appointment.date) === calendarDay)
        .map((appointment) => formatSlotTime(appointment.date))
    ),
  ];

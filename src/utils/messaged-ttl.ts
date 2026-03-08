import { addDays, startOfDay, differenceInSeconds, getDay } from "date-fns";

export function secondsUntilMondayMidnight(): number {
  const now = new Date();
  const dayOfWeek = getDay(now);
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  const nextMonday = startOfDay(addDays(now, daysUntilMonday));
  return differenceInSeconds(nextMonday, now);
}

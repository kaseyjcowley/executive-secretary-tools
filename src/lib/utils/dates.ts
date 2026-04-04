import {
  startOfDay,
  isSameDay,
  nextSunday as nextSundayFrom,
  isSunday,
  getDate,
  getDay,
  lastDayOfMonth,
  subDays,
} from "date-fns";

import { ApiTrelloCard } from "@/requests/cards";

export const isCardDueNextSunday = (card: ApiTrelloCard) => {
  const due = startOfDay(new Date(card.due));
  const closestSunday = getClosestSunday();

  return isSameDay(due, closestSunday);
};

type DatePredicate = (date: Date) => boolean;

export const getClosestSunday = () => {
  const today = startOfDay(Date.now());

  if (isSunday(today)) {
    return today;
  }

  return nextSundayFrom(today);
};

export const isFirstSunday: DatePredicate = (date = getClosestSunday()) => {
  return isSunday(date) && getDate(date) <= 7;
};

export const getLastSundayOfMonth = (date: Date): Date => {
  const lastDay = lastDayOfMonth(date);
  const dayOfWeek = getDay(lastDay);
  const daysToSubtract = dayOfWeek;
  return new Date(
    lastDay.getFullYear(),
    lastDay.getMonth(),
    lastDay.getDate() - daysToSubtract,
  );
};

export const wasYesterdayLastSundayOfMonth = (
  date: Date = new Date(),
): boolean => {
  const yesterday = subDays(date, 1);
  const lastSunday = getLastSundayOfMonth(yesterday);
  return (
    yesterday.getDate() === lastSunday.getDate() &&
    yesterday.getMonth() === lastSunday.getMonth() &&
    yesterday.getFullYear() === lastSunday.getFullYear()
  );
};

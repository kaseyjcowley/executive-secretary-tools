import {
  startOfDay,
  isSameDay,
  nextSunday as nextSundayFrom,
  isSunday,
  getDate,
  getDay,
  lastDayOfMonth,
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
  const lastSunday = new Date(lastDay);
  lastSunday.setDate(lastDay.getDate() - daysToSubtract);
  return startOfDay(lastSunday);
};

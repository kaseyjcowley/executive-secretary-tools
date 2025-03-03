import {
  startOfDay,
  isSameDay,
  nextSunday as nextSundayFrom,
  isSunday,
  getWeekOfMonth,
  getMonth,
} from "date-fns";

import { ApiTrelloCard } from "@/requests/cards";

const APRIL_MONTH = 3;
const OCTOBER_MONTH = 9;

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
  return getWeekOfMonth(date) === 1;
};

export const isGeneralConference: DatePredicate = (
  date = getClosestSunday()
) => {
  const month = getMonth(date);
  return (
    (month === APRIL_MONTH || month === OCTOBER_MONTH) && isFirstSunday(date)
  );
};

import {
  startOfDay,
  isSameDay,
  nextSunday as nextSundayFrom,
  isSunday,
  isToday,
} from "date-fns";

import { ApiTrelloCard } from "@/requests/cards";

export const isCardDueNextSunday = (card: ApiTrelloCard) => {
  const due = startOfDay(new Date(card.due));
  const closestSunday = getClosestSunday();

  return isSameDay(due, closestSunday);
};

export const getClosestSunday = () => {
  const today = startOfDay(Date.now());

  if (isSunday(today)) {
    return today;
  }

  return nextSundayFrom(today);
};

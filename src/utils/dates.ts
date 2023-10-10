import { startOfDay, isSameDay, nextSunday as nextSundayFrom } from "date-fns";

import { ApiTrelloCard } from "@/requests/cards";

export const isCardDueNextSunday = (card: ApiTrelloCard) => {
  const today = startOfDay(Date.now());
  const due = startOfDay(new Date(card.due));
  const nextSunday = nextSundayFrom(today);

  return isSameDay(due, nextSunday);
};

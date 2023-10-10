import { ApiTrelloCard, TrelloCard } from "@/requests/cards";

import { fetchMembers } from "./requests";
import { ApiMember } from "./types";

export const getMemberName = async (
  id: string
): Promise<string | undefined> => {
  const members = await fetchMembers();
  return members.find((m: ApiMember) => m.id === id)?.fullName;
};

export const hydrateMembers = async (
  card: ApiTrelloCard
): Promise<TrelloCard> => {
  const assigned = await getMemberName(card.idMembers);
  return {
    ...card,
    assigned,
  };
};

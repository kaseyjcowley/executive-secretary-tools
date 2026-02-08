import { BishopricMemberName } from "@/constants";
import { ApiTrelloCard, TrelloCard } from "@/requests/cards";

export const getMemberName = (id: string): string | undefined => {
  return id === "unassigned" ? "unassigned" : BishopricMemberName[id];
};

export const hydrateMembers = async (
  card: ApiTrelloCard,
): Promise<TrelloCard> => {
  const assigned = await getMemberName(card.idMembers);
  return {
    ...card,
    assigned,
  };
};

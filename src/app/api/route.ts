import { fetchAllCardsGroupedByMember } from "@/requests/cards";

export async function GET(request: Request) {
  const interviews = await fetchAllCardsGroupedByMember();
  return Response.json(interviews);
}

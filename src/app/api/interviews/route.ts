import { fetchAllCardsGroupedByMember } from "@/requests/cards";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  const interviews = await fetchAllCardsGroupedByMember();
  return Response.json(interviews);
}

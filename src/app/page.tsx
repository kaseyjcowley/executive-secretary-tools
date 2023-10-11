import { InterviewsTable } from "@/components/InterviewsTable";
import { BishopricMemberId } from "@/constants";
import { fetchAllCardsGroupedByMember } from "@/requests/cards";
import { size } from "@/utils/helpers";

export default async function Home() {
  const interviews = await fetchAllCardsGroupedByMember();

  const hasInterviews = size(interviews) > 0;

  return (
    <main className="p-24 flex flex-col space-y-10">
      {!hasInterviews ? (
        <h2 className="text-slate-800">No Interviews</h2>
      ) : (
        Object.values(BishopricMemberId)
          .filter((memberId) => size(interviews[memberId]) > 0)
          .map((memberId) => (
            <InterviewsTable
              key={memberId}
              memberId={memberId}
              interviews={interviews[memberId]}
            />
          ))
      )}
    </main>
  );
}

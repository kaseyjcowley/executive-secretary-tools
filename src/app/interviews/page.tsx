import { Fragment } from "react";
import { format } from "date-fns";
import { InterviewsTable } from "@/components/InterviewsTable";
import { BishopricMemberId } from "@/constants";
import { fetchAllCardsGroupedByMember } from "@/requests/cards";
import { size } from "@/utils/helpers";
import { getClosestSunday } from "@/utils/dates";

export default async function Home() {
  const interviews = await fetchAllCardsGroupedByMember();

  const hasInterviews = size(interviews) > 0;

  return (
    <main className="p-24 flex flex-col space-y-10">
      <h1 className="text-3xl font-bold leading-none tracking-tight text-gray-900">
        Interviews for Sunday {format(getClosestSunday(), "MMM do, yyyy")}
      </h1>
      {!hasInterviews ? (
        <h2 className="text-slate-800">No Interviews</h2>
      ) : (
        <Fragment>
          {Object.values(BishopricMemberId)
            .filter((memberId) => interviews[memberId]?.length > 0)
            .map((memberId) => (
              <InterviewsTable
                key={memberId}
                memberId={memberId}
                interviews={interviews[memberId]}
              />
            ))}
          {interviews.unassigned?.length > 0 && (
            <Fragment>
              <hr />
              <h3>unassigned</h3>
              <InterviewsTable
                memberId="unassigned"
                interviews={interviews.unassigned}
              />
            </Fragment>
          )}
        </Fragment>
      )}
    </main>
  );
}

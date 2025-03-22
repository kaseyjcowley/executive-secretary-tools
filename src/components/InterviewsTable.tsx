import getHours from "date-fns/getHours";
import { utcToZonedTime } from "date-fns-tz";

import { CallingTrelloCard, InterviewTrelloCard } from "@/requests/cards";
import { getMemberName } from "@/requests/members";
import { InterviewRow } from "./InterviewRow";

interface Props {
  memberId: string;
  interviews: Array<InterviewTrelloCard | CallingTrelloCard>;
}

const END_OF_CHURCH_HOUR = 11;

export const InterviewsTable = ({ memberId, interviews }: Props) => {
  const interviewsBeforeChurch = interviews.filter(
    (interview) =>
      getHours(utcToZonedTime(interview.due, "America/Denver")) <
      END_OF_CHURCH_HOUR
  );
  const interviewsAfterChurch = interviews.filter(
    (interview) =>
      getHours(utcToZonedTime(interview.due, "America/Denver")) >=
      END_OF_CHURCH_HOUR
  );

  return (
    <section>
      <h2 className="text-2xl text-slate-900 mb-2">
        {getMemberName(memberId)}
      </h2>

      <h4 className="text-lg mb-2 text-slate-900 italic underline">
        Interviews before church
      </h4>
      <table className="table-fixed text-slate-900 border border-slate-500 w-full mb-8">
        <tbody>
          {interviewsBeforeChurch.map((card) => (
            <InterviewRow key={card.name} card={card} />
          ))}
        </tbody>
      </table>

      <h4 className="text-lg mb-2 text-slate-900 italic underline">
        Interviews after church
      </h4>
      <table className="table-fixed text-slate-900 border border-slate-500 w-full">
        <tbody>
          {interviewsAfterChurch.length > 0 ? (
            interviewsAfterChurch.map((card) => (
              <InterviewRow key={card.name} card={card} />
            ))
          ) : (
            <p className="text-slate-900">No interviews</p>
          )}
        </tbody>
      </table>
    </section>
  );
};

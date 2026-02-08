import getHours from "date-fns/getHours";
import getMinutes from "date-fns/getMinutes";
import { utcToZonedTime } from "date-fns-tz";

import { CallingTrelloCard, InterviewTrelloCard } from "@/requests/cards";
import { getMemberName } from "@/requests/members";
import { InterviewRow } from "./InterviewRow";

interface Props {
  memberId: string;
  interviews: Array<InterviewTrelloCard | CallingTrelloCard>;
}

const END_OF_CHURCH_HOUR = 12;
const END_OF_CHURCH_MINUTE = 30;

export const InterviewsTable = ({ memberId, interviews }: Props) => {
  const interviewsBeforeChurch = interviews.filter((interview) => {
    const zonedDate = utcToZonedTime(interview.due, "America/Denver");
    const hours = getHours(zonedDate);
    const minutes = getMinutes(zonedDate);

    // It's before 12:30 if:
    // 1. The hour is less than 12
    // 2. OR the hour is 12 and the minutes are less than 30
    return (
      hours < END_OF_CHURCH_HOUR ||
      (hours === END_OF_CHURCH_HOUR && minutes < END_OF_CHURCH_MINUTE)
    );
  });
  const interviewsAfterChurch = interviews.filter((interview) => {
    const zonedDate = utcToZonedTime(interview.due, "America/Denver");
    const hours = getHours(zonedDate);
    const minutes = getMinutes(zonedDate);

    return (
      hours > END_OF_CHURCH_HOUR ||
      (hours === END_OF_CHURCH_HOUR && minutes >= END_OF_CHURCH_MINUTE)
    );
  });

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

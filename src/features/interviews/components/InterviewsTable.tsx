import getHours from "date-fns/getHours";
import getMinutes from "date-fns/getMinutes";
import { utcToZonedTime } from "date-fns-tz";

import { BishopricMemberId } from "@/constants";
import { CallingTrelloCard, InterviewTrelloCard } from "@/requests/cards";
import { getMemberName } from "@/requests/members";
import { InterviewRow } from "./InterviewRow";

interface Props {
  memberId: string;
  interviews: Array<InterviewTrelloCard | CallingTrelloCard>;
}

const END_OF_CHURCH_HOUR = 12;
const END_OF_CHURCH_MINUTE = 30;

const MEMBER_BORDER_COLORS: Record<string, string> = {
  "698140165dd97628fcedff99": "border-l-blue-500",
  "6987d4cbda19b8f024c976ab": "border-l-green-500",
  "69817e5a677e074add082272": "border-l-purple-500",
  "5a837d172c1860b067ef60c8": "border-l-orange-500",
  unassigned: "border-l-gray-400",
};

function getBorderColor(memberId: string): string {
  return MEMBER_BORDER_COLORS[memberId] || "border-l-gray-400";
}

export const InterviewsTable = ({ memberId, interviews }: Props) => {
  const interviewsBeforeChurch = interviews.filter((interview) => {
    const zonedDate = utcToZonedTime(interview.due, "America/Denver");
    const hours = getHours(zonedDate);
    const minutes = getMinutes(zonedDate);

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

  const isUnassigned = memberId === "unassigned";

  return (
    <section
      className={`max-w-3xl sm:bg-white sm:rounded-lg sm:shadow-sm sm:border border-gray-200 sm:border-l-4 ${getBorderColor(
        memberId,
      )} overflow-hidden`}
    >
      <div className="p-0 pb-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {getMemberName(memberId)}
        </h2>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                Before Church
              </span>
            </div>
            <div className="space-y-2">
              {interviewsBeforeChurch.length > 0 ? (
                interviewsBeforeChurch.map((card) => (
                  <InterviewRow key={card.name} card={card} />
                ))
              ) : (
                <p className="text-gray-500 text-sm italic py-2">
                  No interviews scheduled
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                After Church
              </span>
            </div>
            <div className="space-y-2">
              {interviewsAfterChurch.length > 0 ? (
                interviewsAfterChurch.map((card) => (
                  <InterviewRow key={card.name} card={card} />
                ))
              ) : (
                <p className="text-gray-500 text-sm italic py-2">
                  No interviews scheduled
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

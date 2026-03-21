import getHours from "date-fns/getHours";
import getMinutes from "date-fns/getMinutes";
import { utcToZonedTime } from "date-fns-tz";

import { CallingTrelloCard, InterviewTrelloCard } from "@/requests/cards";
import { getMemberName } from "@/requests/members";
import { InterviewRow } from "./InterviewRow";
import { Card, CardTitle, Badge } from "@/components/ui";

interface Props {
  memberId: string;
  interviews: Array<InterviewTrelloCard | CallingTrelloCard>;
}

const END_OF_CHURCH_HOUR = 12;
const END_OF_CHURCH_MINUTE = 30;

const MEMBER_ACCENT_COLORS: Record<
  string,
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "error"
> = {
  "698140165dd97628fcedff99": "primary",
  "6987d4cbda19b8f024c976ab": "success",
  "69817e5a677e074add082272": "secondary",
  "5a837d172c1860b067ef60c8": "warning",
  unassigned: "neutral",
};

function getAccentColor(
  memberId: string,
):
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "error" {
  return MEMBER_ACCENT_COLORS[memberId] || "neutral";
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

  return (
    <Card accentColor={getAccentColor(memberId)} className="overflow-hidden">
      <CardTitle className="text-xl mb-4">{getMemberName(memberId)}</CardTitle>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary" size="sm">
              Before Church
            </Badge>
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
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" size="sm">
              After Church
            </Badge>
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
    </Card>
  );
};

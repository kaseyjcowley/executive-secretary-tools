import formatDate from "date-fns/format";
import { utcToZonedTime } from "date-fns-tz";

import { CallingStage } from "@/constants";
import { CallingTrelloCard, InterviewTrelloCard } from "@/requests/cards";

interface Props {
  card: InterviewTrelloCard | CallingTrelloCard;
}

export const InterviewRow = ({ card }: Props) => {
  const isCalling = card.kind === "calling";

  return (
    <div className="max-w-3xl flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex flex-col items-start gap-1 min-w-0">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            isCalling
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {isCalling ? "Calling" : "Interview"}
        </span>
        <div className="text-gray-900 font-medium text-sm sm:text-base truncate">
          {card.name}
        </div>
        <div className="text-gray-500 text-xs">
          {isCalling
            ? card.stage === CallingStage.needsCallingExtended
              ? `Calling as ${card.calling}`
              : `Setting apart as ${card.calling}`
            : (card.labels?.name ?? "Interview")}
        </div>
      </div>
      <div className="flex items-center shrink-0">
        <span className="text-gray-500 font-mono text-xs sm:text-sm whitespace-nowrap">
          {formatDate(utcToZonedTime(card.due, "America/Denver"), "h:mmaaa")}
        </span>
      </div>
    </div>
  );
};

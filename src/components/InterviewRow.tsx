import formatDate from "date-fns/format";
import { utcToZonedTime } from "date-fns-tz";
import { formatDistanceToNow } from "date-fns";

import { CallingStage } from "@/constants";
import { CallingTrelloCard, InterviewTrelloCard } from "@/requests/cards";

interface Props {
  card: InterviewTrelloCard | CallingTrelloCard;
}

export const InterviewRow = ({ card }: Props) => {
  const isCalling = card.kind === "calling";
  const dueDate = utcToZonedTime(card.due, "America/Denver");
  const time = formatDate(dueDate, "h:mmaaa");
  const isTomorrow =
    formatDistanceToNow(dueDate, { addSuffix: true }) !==
    "in less than a minute"
      ? formatDistanceToNow(dueDate, { addSuffix: true }).includes("tomorrow")
      : false;

  return (
    <div className="flex items-center gap-4 px-4 py-4 sm:px-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 w-full max-w-3xl">
      {/* Mobile: Left col (chip + time stacked) */}
      <div className="flex sm:hidden flex-col items-center gap-2 flex-shrink-0">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
            isCalling
              ? "bg-purple-100 text-purple-700"
              : "bg-violet-100 text-violet-700"
          }`}
        >
          {isCalling ? "Calling" : "Interview"}
        </span>
        <p className="text-sm font-semibold text-slate-700">{time}</p>
      </div>

      {/* Mobile: Right col (name + tagline, left aligned) */}
      <div className="flex sm:hidden flex-col flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {card.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          {isCalling
            ? card.stage === CallingStage.needsCallingExtended
              ? `Calling as ${card.calling}`
              : `Setting apart as ${card.calling}`
            : (card.labels?.name ?? "Interview")}
        </p>
      </div>

      {/* Desktop: Chip */}
      <div className="hidden sm:flex flex-shrink-0">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
            isCalling
              ? "bg-purple-100 text-purple-700"
              : "bg-violet-100 text-violet-700"
          }`}
        >
          {isCalling ? "Calling" : "Interview"}
        </span>
      </div>

      {/* Desktop: Name + Tagline */}
      <div className="hidden sm:flex flex-col flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {card.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          {isCalling
            ? card.stage === CallingStage.needsCallingExtended
              ? `Calling as ${card.calling}`
              : `Setting apart as ${card.calling}`
            : (card.labels?.name ?? "Interview")}
        </p>
      </div>

      {/* Desktop: Time */}
      <div className="hidden sm:flex flex-shrink-0 flex-col items-end">
        <p className="text-sm font-semibold text-slate-700">{time}</p>
        {isTomorrow && (
          <p className="text-xs text-slate-400 mt-0.5">Tomorrow</p>
        )}
      </div>
    </div>
  );
};

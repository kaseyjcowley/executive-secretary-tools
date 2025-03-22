import getHours from "date-fns/getHours";
import getMinutes from "date-fns/getMinutes";
import formatDate from "date-fns/format";
import { utcToZonedTime } from "date-fns-tz";

import { CallingStage } from "@/constants";
import { CallingTrelloCard, InterviewTrelloCard } from "@/requests/cards";

interface Props {
  card: InterviewTrelloCard | CallingTrelloCard;
}

export const InterviewRow = ({ card }: Props) => {
  const hour = getHours(new Date(card.due));
  const minutes = getMinutes(new Date(card.due));
  return (
    <tr
      key={card.name}
      className={`odd:bg-white even:bg-slate-50 ${
        hour === 11 && minutes === 0 ? `border-t-4 border-slate-900` : ``
      }`}
    >
      <td className="border border-slate-500 p-2">{card.name}</td>
      <td className="border border-slate-500 p-2">
        {formatDate(utcToZonedTime(card.due, "America/Denver"), "h:mmaaa")}
      </td>
      <td className="border border-slate-500 p-2">
        {(() => {
          switch (card.kind) {
            case "calling": {
              return card.stage === CallingStage.needsCallingExtended
                ? `Calling as ${card.calling}`
                : `Setting apart as ${card.calling}`;
            }
            case "interview": {
              return card.labels?.name ?? "Interview";
            }
          }
        })()}
      </td>
    </tr>
  );
};

import { format as formatDate } from "date-fns-tz";
import getHours from "date-fns/getHours";
import getMinutes from "date-fns/getMinutes";

import { CallingTrelloCard, InterviewTrelloCard } from "@/requests/cards";
import { getMemberName } from "@/requests/members";
import { CallingStage } from "@/constants";

interface Props {
  memberId: string;
  interviews: Array<InterviewTrelloCard | CallingTrelloCard>;
}

export const InterviewsTable = ({ memberId, interviews }: Props) => {
  return (
    <table className="table-fixed text-slate-900 border border-slate-500 w-full">
      <tbody>
        <tr className="border border-slate-500">
          <td className="p-2 font-bold">{getMemberName(memberId)}</td>
        </tr>
        {interviews.map((card) => {
          const hour = getHours(new Date(card.due));
          const minutes = getMinutes(new Date(card.due));
          return (
            <tr
              key={card.name}
              className={`odd:bg-white even:bg-slate-50 ${
                hour === 14 && minutes === 0
                  ? `border-t-4 border-slate-900`
                  : ``
              }`}
            >
              <td className="border border-slate-500 p-2">{card.name}</td>
              <td className="border border-slate-500 p-2">
                {formatDate(new Date(card.due), "h:mmaaa", {
                  timeZone: "America/Denver",
                })}
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
                      return card.labels?.name;
                    }
                  }
                })()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

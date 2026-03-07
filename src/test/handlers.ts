import { http, HttpResponse } from "msw";
import { CallingStage } from "@/constants";

const API_KEY = process.env.TRELLO_API_KEY || "test-api-key";
const API_TOKEN = process.env.TRELLO_API_TOKEN || "test-api-token";

export const mockInterviewCards = [
  {
    id: "card-1",
    name: "Smith, John - Bishop Interview",
    due: "2024-01-15T14:00:00.000Z",
    idMembers: "member-1",
    labels: [{ id: "label-1", name: "Bishop Interview" }],
  },
  {
    id: "card-2",
    name: "Doe, Jane - Temple Recommend Renewal",
    due: "2024-01-20T15:00:00.000Z",
    idMembers: "member-2",
    labels: [{ id: "label-2", name: "Temple" }],
  },
  {
    id: "card-3",
    name: "Brown, Bob - Welfare Meeting",
    due: "2024-01-22T10:00:00.000Z",
    idMembers: "member-3",
    labels: [{ id: "label-3", name: "Welfare" }],
  },
];

export const mockCallingCards = [
  {
    id: "card-4",
    name: "Johnson, Mike - Ward Missionary",
    due: "2024-01-25T12:00:00.000Z",
    idMembers: "member-4",
  },
  {
    id: "card-5",
    name: "Williams, Sarah - Primary Teacher",
    due: "2024-01-26T13:00:00.000Z",
    idMembers: "member-5",
  },
];

export const handlers = [
  http.get(
    `https://api.trello.com/1/lists/698142f18c51336104b0ca17/cards`,
    ({ request }) => {
      const url = new URL(request.url);
      const key = url.searchParams.get("key");
      const token = url.searchParams.get("token");

      if (key !== API_KEY || token !== API_TOKEN) {
        return new HttpResponse(null, { status: 401 });
      }

      return HttpResponse.json(mockInterviewCards);
    },
  ),
  http.get(
    `https://api.trello.com/1/lists/69814029755d3899bbf4191c/cards`,
    ({ request }) => {
      const url = new URL(request.url);
      const key = url.searchParams.get("key");
      const token = url.searchParams.get("token");

      if (key !== API_KEY || token !== API_TOKEN) {
        return new HttpResponse(null, { status: 401 });
      }

      return HttpResponse.json(
        mockCallingCards.filter(
          () => CallingStage.needsCallingExtended === "needs_calling_extended",
        ),
      );
    },
  ),
  http.get(
    `https://api.trello.com/1/lists/5f62bc2052e58c7dc5740b4f/cards`,
    ({ request }) => {
      const url = new URL(request.url);
      const key = url.searchParams.get("key");
      const token = url.searchParams.get("token");

      if (key !== API_KEY || token !== API_TOKEN) {
        return new HttpResponse(null, { status: 401 });
      }

      return HttpResponse.json(
        mockCallingCards.filter(
          () => CallingStage.needsSettingApart === "needs_setting_apart",
        ),
      );
    },
  ),
];

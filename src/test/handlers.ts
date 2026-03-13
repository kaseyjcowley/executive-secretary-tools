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
  http.get(`/api/messaged-status`, () => {
    return HttpResponse.json({ messaged: [] });
  }),
  http.post(`/api/mark-messaged`, () => {
    return HttpResponse.json({ ok: true, expiresInSeconds: 86400 });
  }),
  http.post(`/api/unmark-messaged`, () => {
    return HttpResponse.json({ ok: true });
  }),
  http.post(`/api/llm`, async ({ request }) => {
    const body = (await request.json()) as {
      job: string;
      payload: { templateName: string; data: Record<string, unknown> };
    };
    const { templateName, data } = body.payload;
    const recipients = (data.recipients as string[]) || [];

    const responses: Record<string, string> = {
      "bishop-interview":
        "Hello! You have a bishop interview scheduled. Please let me know if you have any questions.",
      "temple-recommend-renewal":
        "Hello! Our records indicate your temple recommend expires soon. The Bishopric has times available for renewals.",
      "welfare-meeting":
        "Hello! You have a welfare meeting scheduled. Please let me know if you need any accommodations.",
      "multiple-appointments": `Hello ${recipients[0] || "there"}! Here are your upcoming appointments. Let me know if you have any questions.`,
      "bishop-youth-interview": data.subjects
        ? `Hey ${recipients[0] || "there"}! Are ${data.subjects} available Sunday at 12:30 for their annual interview with Bishop?`
        : "Hey! Are the youth available for their bishop interview this Sunday?",
    };

    let message: string;
    if (responses[templateName]) {
      message = responses[templateName];
    } else if (templateName.includes("temple")) {
      message = responses["temple-recommend-renewal"];
    } else if (templateName.includes("welfare")) {
      message = responses["welfare-meeting"];
    } else if (templateName.includes("bishop")) {
      message = responses["bishop-youth-interview"];
    } else {
      return HttpResponse.json(
        { error: { message: "Unknown template" } },
        { status: 400 },
      );
    }

    return HttpResponse.json({ result: { message } });
  }),
];

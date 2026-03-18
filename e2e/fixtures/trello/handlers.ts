import { http, HttpResponse } from "msw";
import {
  mockMembers,
  mockLabels,
  mockInterviewCards,
  mockCallingCards,
  mockYouthCards,
} from "./mockData";

const API_KEY = process.env.TRELLO_API_KEY || "test-api-key";
const API_TOKEN = process.env.TRELLO_API_TOKEN || "test-api-token";

const validateAuth = (url: URL) => {
  const key = url.searchParams.get("key");
  const token = url.searchParams.get("token");
  return key === API_KEY && token === API_TOKEN;
};

export const handlers = [
  http.get(
    "https://api.trello.com/1/lists/:listId/cards",
    ({ request, params }) => {
      const url = new URL(request.url);
      if (!validateAuth(url)) {
        return new HttpResponse(null, { status: 401 });
      }

      const { listId } = params;

      if (
        ["698142f18c51336104b0ca17", "698142f18c51336104b0ca18"].includes(
          listId as string,
        )
      ) {
        return HttpResponse.json(mockInterviewCards);
      }

      if (
        listId === "69814029755d3899bbf4191c" ||
        listId === "6981402b631c5d579084983f"
      ) {
        return HttpResponse.json(mockCallingCards);
      }

      if (
        ["6981403b91ce00795685a559", "5f62bc2052e58c7dc5740b4f"].includes(
          listId as string,
        )
      ) {
        return HttpResponse.json(mockCallingCards);
      }

      if (listId === "698142f18c51336104b0ca17") {
        return HttpResponse.json(
          mockYouthCards.filter(
            (c) => c.idList === "698142f18c51336104b0ca17",
          ),
        );
      }

      if (listId === "698142f18c51336104b0ca19") {
        return HttpResponse.json(
          mockYouthCards.filter(
            (c) => c.idList === "698142f18c51336104b0ca19",
          ),
        );
      }

      return HttpResponse.json([]);
    },
  ),

  http.get("https://api.trello.com/1/boards/:boardId/members", ({ request }) => {
    const url = new URL(request.url);
    if (!validateAuth(url)) {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json(mockMembers);
  }),

  http.get("https://api.trello.com/1/boards/:boardId/labels", ({ request }) => {
    const url = new URL(request.url);
    if (!validateAuth(url)) {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json(mockLabels);
  }),

  http.get("https://api.trello.com/1/boards/:boardId/cards", ({ request }) => {
    const url = new URL(request.url);
    if (!validateAuth(url)) {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json(mockYouthCards);
  }),

  http.post("https://api.trello.com/1/cards", async ({ request }) => {
    const url = new URL(request.url);
    if (!validateAuth(url)) {
      return new HttpResponse(null, { status: 401 });
    }

    const body = (await request.json()) as {
      name: string;
      desc?: string;
      idList: string;
    };

    return HttpResponse.json({
      id: `card-${Date.now()}`,
      name: body.name,
      desc: body.desc || "",
      url: `https://trello.com/c/new-${Date.now()}`,
      shortUrl: `https://trello.com/c/new-${Date.now()}`,
      idList: body.idList,
    });
  }),
];

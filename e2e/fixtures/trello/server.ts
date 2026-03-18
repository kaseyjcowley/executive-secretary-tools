import { Hono } from "hono";
import { serve } from "@hono/node-server";
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

const app = new Hono();

app.use("*", async (c, next) => {
  const url = new URL(c.req.url);
  if (!validateAuth(url)) {
    return c.text("Unauthorized", 401);
  }
  await next();
});

app.get("/1/lists/:listId/cards", (c) => {
  const listId = c.req.param("listId");

  if (
    ["698142f18c51336104b0ca17", "698142f18c51336104b0ca18"].includes(
      listId,
    )
  ) {
    return c.json(mockInterviewCards);
  }

  if (
    listId === "69814029755d3899bbf4191c" ||
    listId === "6981402b631c5d579084983f"
  ) {
    return c.json(mockCallingCards);
  }

  if (
    ["6981403b91ce00795685a559", "5f62bc2052e58c7dc5740b4f"].includes(
      listId,
    )
  ) {
    return c.json(mockCallingCards);
  }

  if (listId === "698142f18c51336104b0ca17") {
    return c.json(
      mockYouthCards.filter(
        (c) => c.idList === "698142f18c51336104b0ca17",
      ),
    );
  }

  if (listId === "698142f18c51336104b0ca19") {
    return c.json(
      mockYouthCards.filter(
        (c) => c.idList === "698142f18c51336104b0ca19",
      ),
    );
  }

  return c.json([]);
});

app.get("/1/boards/:boardId/members", (c) => {
  return c.json(mockMembers);
});

app.get("/1/boards/:boardId/labels", (c) => {
  return c.json(mockLabels);
});

app.get("/1/boards/:boardId/cards", (c) => {
  return c.json(mockYouthCards);
});

app.post("/1/cards", async (c) => {
  const body = await c.req.json<{
    name: string;
    desc?: string;
    idList: string;
  }>();

  return c.json({
    id: `card-${Date.now()}`,
    name: body.name,
    desc: body.desc || "",
    url: `https://trello.com/c/new-${Date.now()}`,
    shortUrl: `https://trello.com/c/new-${Date.now()}`,
    idList: body.idList,
  });
});

const port = parseInt(process.env.MOCK_TRELLO_PORT || "9999");
console.log(`Mock Trello server running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

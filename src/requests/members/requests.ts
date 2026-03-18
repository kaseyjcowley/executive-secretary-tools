import { ApiMember } from "./types";

const TRELLO_BASE_URL = process.env.TRELLO_BASE_URL || "https://api.trello.com";

export const fetchMembers = async (): Promise<ApiMember[]> => {
  return await fetch(
    `${TRELLO_BASE_URL}/1/boards/69813f1cb775468cd996e126/members?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`
  )
    .then((response) => response.json())
    .catch((err) => console.error(err));
};

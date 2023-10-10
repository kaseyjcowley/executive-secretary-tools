import { ApiMember } from "./types";

export const fetchMembers = async (): Promise<ApiMember[]> => {
  return await fetch(
    `https://api.trello.com/1/boards/5f62c8d17e174a5346016935/members?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`
  )
    .then((response) => response.json())
    .catch((err) => console.error(err));
};

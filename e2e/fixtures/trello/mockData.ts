export const mockMembers = [
  { id: "member-1", fullName: "John Smith", username: "jsmith" },
  { id: "member-2", fullName: "Jane Doe", username: "jdoe" },
  { id: "member-3", fullName: "Bob Wilson", username: "bwilson" },
  { id: "member-4", fullName: "Mike Johnson", username: "mjohnson" },
  { id: "member-5", fullName: "Sarah Williams", username: "swilliams" },
];

export const mockLabels = [
  { id: "698423d96a77cbb730ddbfc5", name: "Bishop youth interview" },
  { id: "698142f18c51336104b0ca0b", name: "Counselor youth interview" },
  { id: "698142f18c51336104b0ca0c", name: "High school grad check-in" },
];

export const mockInterviewCards = [
  {
    id: "card-int-1",
    name: "Smith, John - Bishop Interview",
    due: "2024-01-15T14:00:00.000Z",
    idMembers: ["member-1"],
    labels: [{ id: "label-1", name: "Bishop Interview" }],
  },
  {
    id: "card-int-2",
    name: "Doe, Jane - Temple Recommend Renewal",
    due: "2024-01-20T15:00:00.000Z",
    idMembers: ["member-2"],
    labels: [{ id: "label-2", name: "Temple" }],
  },
  {
    id: "card-int-3",
    name: "Brown, Bob - Welfare Meeting",
    due: "2024-01-22T10:00:00.000Z",
    idMembers: ["member-3"],
    labels: [{ id: "label-3", name: "Welfare" }],
  },
];

export const mockCallingCards = [
  {
    id: "card-call-1",
    name: "Johnson, Mike - Ward Missionary",
    due: "2024-01-25T12:00:00.000Z",
    idMembers: ["member-4"],
  },
  {
    id: "card-call-2",
    name: "Williams, Sarah - Primary Teacher",
    due: "2024-01-26T13:00:00.000Z",
    idMembers: ["member-5"],
  },
];

export const mockYouthCards = [
  {
    id: "youth-card-1",
    name: "John Doe",
    desc: "Test note",
    url: "https://trello.com/c/y1",
    shortUrl: "https://trello.com/c/y1",
    idList: "698142f18c51336104b0ca17",
    dateLastActivity: "2024-01-10T10:00:00.000Z",
    due: "2024-01-15T14:00:00.000Z",
    labels: [
      { id: "698423d96a77cbb730ddbfc5", name: "Bishop youth interview" },
    ],
  },
  {
    id: "youth-card-2",
    name: "Jane Doe",
    desc: "",
    url: "https://trello.com/c/y2",
    shortUrl: "https://trello.com/c/y2",
    idList: "698142f18c51336104b0ca19",
    dateLastActivity: "2024-01-12T10:00:00.000Z",
    due: "2024-01-20T14:00:00.000Z",
    labels: [],
  },
  {
    id: "youth-card-3",
    name: "Bobby Smith",
    desc: "Needs follow up",
    url: "https://trello.com/c/y3",
    shortUrl: "https://trello.com/c/y3",
    idList: "698142f18c51336104b0ca17",
    dateLastActivity: "2024-01-11T10:00:00.000Z",
    due: "2024-01-16T14:00:00.000Z",
    labels: [
      { id: "698142f18c51336104b0ca0b", name: "Counselor youth interview" },
    ],
  },
];

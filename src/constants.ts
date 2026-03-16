enum BishopricMember {
  bishop = "bishop",
  firstCounselor = "firstCounselor",
  secondCounselor = "secondCounselor",
  executiveSecretary = "executiveSecretary",
}

export const BishopricMemberId: Record<BishopricMember, string> = {
  [BishopricMember.bishop]: "698140165dd97628fcedff99",
  [BishopricMember.firstCounselor]: "6987d4cbda19b8f024c976ab",
  [BishopricMember.secondCounselor]: "69817e5a677e074add082272",
  [BishopricMember.executiveSecretary]: "5a837d172c1860b067ef60c8",
} as const;

export enum SlackChannelId {
  automationTesting = "C0AD3RZ8HUJ",
  bishopric = "C0AC1JS0HKM",
  wardCouncil = "C0ACLTZKA9X",
}

export const BishopricSlackMemberIds: Record<BishopricMember, string> = {
  [BishopricMember.bishop]: "U0ABURZDH39",
  [BishopricMember.firstCounselor]: "U0AE1TWL95X",
  [BishopricMember.secondCounselor]: "U0AD4HC8Z3J",
  [BishopricMember.executiveSecretary]: "U0AC0G1MMJ7",
} as const;

export enum CallingStage {
  needsCallingExtended = "needs_calling_extended",
  needsSettingApart = "needs_setting_apart",
}

export const BishopricMemberName: Record<
  (typeof BishopricMemberId)[keyof typeof BishopricMemberId],
  string
> = {
  "698140165dd97628fcedff99": "Ryan Preece",
  "6987d4cbda19b8f024c976ab": "Roger Schultz",
  "69817e5a677e074add082272": "Dave Thibault",
  "5a837d172c1860b067ef60c8": "Kasey Cowley",
} as const;

// Trello list IDs for appointment messaging system
// Configure as arrays in src/app/api/contacts/route.ts:
//   APPOINTMENT_INTERVIEW_LIST_IDS: string[] = ["listId1", "listId2"]
//   APPOINTMENT_CALLING_LIST_IDS: string[] = ["listId3", "listId4"]
// To get list IDs: Open Trello list, check URL: /b/{boardId}/{listName}?l={listId}

// Time constants for appointment scheduling
export const CHURCH_END_TIME = "12:30";

function generateTimeRange(
  start: string,
  end: string,
  incrementMinutes: number,
): string[] {
  const times: string[] = [];
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin <= endMin)
  ) {
    times.push(
      `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`,
    );
    currentMin += incrementMinutes;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return times;
}

export const BEFORE_CHURCH_TIMES = generateTimeRange("09:00", "10:25", 5);
export const AFTER_CHURCH_TIMES = generateTimeRange("12:30", "14:00", 5);

// Conductor rotation Redis keys
export const REDIS_KEYS = {
  CONDUCTOR_ROTATION: "church:conductors:rotation",
  CONDUCTOR_CURRENT_INDEX: "church:conductors:currentIndex",
  CONDUCTOR_OVERRIDE: "church:conductors:override",
  TEMPLATES: "church:templates",
  TEMPLATE_PREFIX: "church:templates:",
  MESSAGED_CONTACT_PREFIX: "church:messaged:",
  YOUTH_HASH_PREFIX: "youth:",
  YOUTH_QUEUE: "youth:queue",
  YOUTH_VISITS_PREFIX: "youth:visits:",
  YOUTH_SYNCED_CARDS: "youth:syncedCards",
  YOUTH_PENDING_REVIEWS: "youth:pendingReviews",
} as const;

// Trello sync configuration
export const TRELLO_SYNC_CONFIG = {
  YOUTH_LABEL_ID: "69b7682060c904a714a7d895",
  YOUTH_VISIT_LABEL_IDS: [
    "698423d96a77cbb730ddbfc5", // Bishop youth interview
    "698142f18c51336104b0ca0b", // Counselor youth interview
    "698142f18c51336104b0ca0c", // High school grad check-in
  ] as string[],
  AUTO_COMMIT_THRESHOLD: 0.15,
  REVIEW_THRESHOLD: 0.35,
} as const;

// Trello List IDs for Appointment Messaging
export const TRELLO_LIST_IDS = {
  APPOINTMENT_INTERVIEWS: ["698142f18c51336104b0ca17"],
  CALLINGS_NEEDS_EXTENSION: "69814029755d3899bbf4191c",
  CALLINGS_NEEDS_SETTING_APART: "5f62bc2052e58c7dc5740b4f",
  INTERVIEW_BOARD: ["698142f18c51336104b0ca18"],
  CALLINGS_BOARD: ["6981402b631c5d579084983f"],
  SETTING_APART_BOARD: ["6981403b91ce00795685a559", "5f62bc2052e58c7dc5740b4f"],
  YOUTH_VISITS_TO_SCHEDULE: "698142f18c51336104b0ca17",
  YOUTH_VISITS_COMPLETE: "698142f18c51336104b0ca19",
} as const;

// Member selection constants
export const MEMBER_SELECTION = {
  INITIAL_MEMBER_ID: -1,
  MAX_RECIPIENTS: 2,
} as const;

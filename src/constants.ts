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

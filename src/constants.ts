enum BishopricMember {
  bishop = "bishop",
  firstCounselor = "firstCounselor",
  secondCounselor = "secondCounselor",
  executiveSecretary = "executiveSecretary",
}

export const BishopricMemberId: Record<BishopricMember, string> = {
  [BishopricMember.bishop]: "5f5b72d54777a21de18c6ac5",
  [BishopricMember.firstCounselor]: "575498b14e0af55e0d2a90d1",
  [BishopricMember.secondCounselor]: "617ab001171dce606829c4a0",
  [BishopricMember.executiveSecretary]: "5a837d172c1860b067ef60c8",
} as const;

export enum SlackChannelId {
  automationTesting = "C04R54CHA78",
  bishopric = "C01AFJHRJ49",
  wardCouncil = "C01A3032RB4",
}

export const BishopricSlackMemberIds: Record<BishopricMember, string> = {
  [BishopricMember.bishop]: "U01ASQSJ04Q",
  [BishopricMember.firstCounselor]: "U01BTJHB2Q4",
  [BishopricMember.secondCounselor]: "U026TTPBT4H",
  [BishopricMember.executiveSecretary]: "U01B1LT9999",
} as const;

export enum CallingStage {
  needsCallingExtended = "needs_calling_extended",
  needsSettingApart = "needs_setting_apart",
}

export const BishopricMemberName: Record<
  (typeof BishopricMemberId)[keyof typeof BishopricMemberId],
  string
> = {
  "5f5b72d54777a21de18c6ac5": "Paul Hill",
  "575498b14e0af55e0d2a90d1": "Dan Boles",
  "617ab001171dce606829c4a0": "Steve Nielsen",
  "5a837d172c1860b067ef60c8": "Kasey Cowley",
} as const;

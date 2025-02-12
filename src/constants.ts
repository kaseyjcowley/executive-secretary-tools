enum BishopricMember {
  bishop = "bishop",
  firstCounselor = "firstCounselor",
  secondCounselor = "secondCounselor",
  executiveSecretary = "executiveSecretary",
}

export const BishopricMemberId: Record<BishopricMember, string> = {
  [BishopricMember.bishop]: "5f5b72d54777a21de18c6ac5",
  [BishopricMember.firstCounselor]: "5552302a4bb771aa0a2532e2",
  [BishopricMember.secondCounselor]: "67a938bda1e6bd8da53408ba",
  [BishopricMember.executiveSecretary]: "5a837d172c1860b067ef60c8",
} as const;

export enum SlackChannelId {
  automationTesting = "C04R54CHA78",
  bishopric = "C08CE1P0NBF",
  wardCouncil = "C01A3032RB4",
}

export const BishopricSlackMemberIds: Record<BishopricMember, string> = {
  [BishopricMember.bishop]: "U01ASQSJ04Q",
  [BishopricMember.firstCounselor]: "U02RLUSKGQL",
  [BishopricMember.secondCounselor]: "U08DC1RGZME",
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
  "5552302a4bb771aa0a2532e2": "Chris Davis",
  "67a938bda1e6bd8da53408ba": "Will Stewart",
  "5a837d172c1860b067ef60c8": "Kasey Cowley",
} as const;

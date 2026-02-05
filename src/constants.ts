enum BishopricMember {
  bishop = "bishop",
  firstCounselor = "firstCounselor",
  secondCounselor = "secondCounselor",
  executiveSecretary = "executiveSecretary",
}

export const BishopricMemberId: Record<BishopricMember, string> = {
  [BishopricMember.bishop]: "698140165dd97628fcedff99",
  [BishopricMember.firstCounselor]: "5552302a4bb771aa0a2532e2",
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
  [BishopricMember.firstCounselor]: "U02RLUSKGQL",
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
  "5f5b72d54777a21de18c6ac5": "Ryan Preece",
  "5552302a4bb771aa0a2532e2": "Roger Schultz",
  "67a938bda1e6bd8da53408ba": "Dave Thibault",
  "5a837d172c1860b067ef60c8": "Kasey Cowley",
} as const;

import { useMemo } from "react";
import members from "@/data/members.json";
import { Member } from "@/utils/format-member-display";

const memberData = members as Member[];

export function useMemberPhoneNumbers(memberIds: number[]) {
  const phoneNumbers = useMemo(() => {
    return memberData
      .filter((m) => memberIds.includes(m.id))
      .map((m) => m.phone)
      .filter((p): p is string => !!p);
  }, [memberIds]);

  return phoneNumbers;
}

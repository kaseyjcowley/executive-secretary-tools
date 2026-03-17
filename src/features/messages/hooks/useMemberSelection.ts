import { useState } from "react";
import { matchContact } from "@/utils/contact-fuzzy-match";

const INITIAL_MEMBER_ID = -1;
const MAX_MEMBERS = 2;

export function useMemberSelection(contactName: string) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>(() => {
    const matchedId = matchContact(contactName);
    return matchedId ? [matchedId] : [INITIAL_MEMBER_ID];
  });

  const addMember = () => {
    if (selectedMemberIds.length < MAX_MEMBERS) {
      setSelectedMemberIds([...selectedMemberIds, INITIAL_MEMBER_ID]);
    }
  };

  const removeMember = (index: number) => {
    setSelectedMemberIds(selectedMemberIds.filter((_, i) => i !== index));
  };

  const changeMember = (index: number, memberId: number | undefined) => {
    if (memberId === undefined) {
      setSelectedMemberIds(selectedMemberIds.filter((_, i) => i !== index));
    } else {
      setSelectedMemberIds(
        selectedMemberIds.map((id, i) => (i === index ? memberId : id)),
      );
    }
  };

  return {
    selectedMemberIds,
    addMember,
    removeMember,
    changeMember,
  };
}

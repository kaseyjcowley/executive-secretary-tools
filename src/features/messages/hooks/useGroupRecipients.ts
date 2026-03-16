import { useState, useMemo } from "react";
import { Contact } from "@/types/messages";
import { MEMBER_SELECTION } from "@/constants";
import members from "@/data/members.json";
import { Member } from "@/utils/format-member-display";

const memberData = members as Member[];

export function useGroupRecipients(groupContacts: Contact[]) {
  const [recipientsAreSubjects, setRecipientsAreSubjects] = useState(false);
  const [selectedRecipientMemberIds, setSelectedRecipientMemberIds] = useState<
    number[]
  >([MEMBER_SELECTION.INITIAL_MEMBER_ID]);

  const selectedRecipients = useMemo(() => {
    if (recipientsAreSubjects) {
      return groupContacts;
    }
    return memberData
      .filter((m) => selectedRecipientMemberIds.includes(m.id))
      .map((m) => {
        const contact = groupContacts.find((c) => c.name === m.name);
        return contact || ({ name: m.name, kind: "interview" } as Contact);
      });
  }, [recipientsAreSubjects, selectedRecipientMemberIds, groupContacts]);

  const recipientPhoneNumbers = useMemo(() => {
    if (recipientsAreSubjects) {
      return selectedRecipients
        .map((r) => ("phone" in r ? r.phone : undefined))
        .filter((p): p is string => !!p);
    }
    return memberData
      .filter((m) => selectedRecipientMemberIds.includes(m.id))
      .map((m) => m.phone)
      .filter((p): p is string => !!p);
  }, [recipientsAreSubjects, selectedRecipients, selectedRecipientMemberIds]);

  const handleAddRecipient = () => {
    if (selectedRecipientMemberIds.length < MEMBER_SELECTION.MAX_RECIPIENTS) {
      setSelectedRecipientMemberIds([
        ...selectedRecipientMemberIds,
        MEMBER_SELECTION.INITIAL_MEMBER_ID,
      ]);
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setSelectedRecipientMemberIds(
      selectedRecipientMemberIds.filter((_, i) => i !== index),
    );
  };

  const handleChangeRecipient = (
    index: number,
    memberId: number | undefined,
  ) => {
    if (memberId === undefined) {
      setSelectedRecipientMemberIds(
        selectedRecipientMemberIds.filter((_, i) => i !== index),
      );
    } else {
      setSelectedRecipientMemberIds(
        selectedRecipientMemberIds.map((id, i) =>
          i === index ? memberId : id,
        ),
      );
    }
  };

  const handleRecipientsAreSubjectsChange = (checked: boolean) => {
    setRecipientsAreSubjects(checked);
    if (checked) {
      setSelectedRecipientMemberIds([MEMBER_SELECTION.INITIAL_MEMBER_ID]);
    }
  };

  return {
    recipientsAreSubjects,
    selectedRecipientMemberIds,
    selectedRecipients,
    recipientPhoneNumbers,
    handleAddRecipient,
    handleRemoveRecipient,
    handleChangeRecipient,
    handleRecipientsAreSubjectsChange,
  };
}

import { useState, useMemo } from "react";
import { matchContact } from "@/utils/contact-fuzzy-match";
import { MEMBER_SELECTION } from "@/constants";
import { useMemberPhoneNumbers } from "./useMemberPhoneNumbers";

export interface UseRecipientSubjectSelectionOptions {
  contactName: string;
  defaultRecipientsAreSubjects?: boolean;
}

export function useRecipientSubjectSelection({
  contactName,
  defaultRecipientsAreSubjects = true,
}: UseRecipientSubjectSelectionOptions) {
  const [recipientMemberIds, setRecipientMemberIds] = useState<number[]>(() => {
    const matchedId = matchContact(contactName);
    return matchedId ? [matchedId] : [MEMBER_SELECTION.INITIAL_MEMBER_ID];
  });
  const [subjectMemberIds, setSubjectMemberIds] = useState<number[]>(() => {
    if (!defaultRecipientsAreSubjects) {
      const matchedId = matchContact(contactName);
      return matchedId ? [matchedId] : [MEMBER_SELECTION.INITIAL_MEMBER_ID];
    }
    return [];
  });
  const [recipientsAreSubjects, setRecipientsAreSubjects] = useState(
    defaultRecipientsAreSubjects,
  );

  const addRecipient = () => {
    if (recipientMemberIds.length < MEMBER_SELECTION.MAX_RECIPIENTS) {
      setRecipientMemberIds([
        ...recipientMemberIds,
        MEMBER_SELECTION.INITIAL_MEMBER_ID,
      ]);
    }
  };

  const removeRecipient = (index: number) => {
    setRecipientMemberIds(recipientMemberIds.filter((_, i) => i !== index));
  };

  const changeRecipient = (index: number, memberId: number | undefined) => {
    if (memberId === undefined) {
      setRecipientMemberIds(recipientMemberIds.filter((_, i) => i !== index));
    } else {
      setRecipientMemberIds(
        recipientMemberIds.map((id, i) => (i === index ? memberId : id)),
      );
    }
  };

  const addSubject = () => {
    setSubjectMemberIds([
      ...subjectMemberIds,
      MEMBER_SELECTION.INITIAL_MEMBER_ID,
    ]);
  };

  const removeSubject = (index: number) => {
    setSubjectMemberIds(subjectMemberIds.filter((_, i) => i !== index));
  };

  const changeSubject = (index: number, memberId: number | undefined) => {
    if (memberId === undefined) {
      setSubjectMemberIds(subjectMemberIds.filter((_, i) => i !== index));
    } else {
      setSubjectMemberIds(
        subjectMemberIds.map((id, i) => (i === index ? memberId : id)),
      );
    }
  };

  const handleSetRecipientsAreSubjects = (checked: boolean) => {
    // Avoid unnecessary updates: only change state when values differ to
    // reduce the chance of triggering nested update cycles.
    setRecipientsAreSubjects((prev) => {
      if (prev === checked) return prev;
      return checked;
    });

    if (checked) {
      // Only clear if not already empty
      setSubjectMemberIds((prev) => (prev.length === 0 ? prev : []));
    } else {
      const matchedId = matchContact(contactName);
      const next = matchedId
        ? [matchedId]
        : [MEMBER_SELECTION.INITIAL_MEMBER_ID];
      setSubjectMemberIds((prev) => {
        // simple deep-equality for single-item arrays or compare lengths
        if (
          prev.length === next.length &&
          prev.every((v, i) => v === next[i])
        ) {
          return prev;
        }
        return next;
      });
    }
  };

  const effectiveSubjectIds = useMemo(() => {
    if (recipientsAreSubjects) {
      return recipientMemberIds.filter(
        (id) => id !== MEMBER_SELECTION.INITIAL_MEMBER_ID,
      );
    }
    return subjectMemberIds.filter(
      (id) => id !== MEMBER_SELECTION.INITIAL_MEMBER_ID,
    );
  }, [recipientsAreSubjects, recipientMemberIds, subjectMemberIds]);

  const recipientPhoneNumbers = useMemberPhoneNumbers(recipientMemberIds);
  const subjectPhoneNumbers = useMemberPhoneNumbers(subjectMemberIds);

  return {
    recipientMemberIds,
    subjectMemberIds,
    recipientsAreSubjects,
    setRecipientsAreSubjects: handleSetRecipientsAreSubjects,
    effectiveSubjectIds,
    addRecipient,
    removeRecipient,
    changeRecipient,
    addSubject,
    removeSubject,
    changeSubject,
    recipientPhoneNumbers,
    subjectPhoneNumbers,
  };
}

import { useEffect, useState, useMemo } from "react";
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
  const [recipientMemberIds, setRecipientMemberIds] = useState<number[]>([
    MEMBER_SELECTION.INITIAL_MEMBER_ID,
  ]);
  const [subjectMemberIds, setSubjectMemberIds] = useState<number[]>([]);
  const [recipientsAreSubjects, setRecipientsAreSubjects] = useState(
    defaultRecipientsAreSubjects,
  );

  useEffect(() => {
    const matchedId = matchContact(contactName);
    if (matchedId) {
      setRecipientMemberIds([matchedId]);
    } else {
      setRecipientMemberIds([MEMBER_SELECTION.INITIAL_MEMBER_ID]);
    }
  }, [contactName]);

  useEffect(() => {
    if (!recipientsAreSubjects) {
      const matchedId = matchContact(contactName);
      if (matchedId) {
        setSubjectMemberIds([matchedId]);
      } else if (subjectMemberIds.length === 0) {
        setSubjectMemberIds([MEMBER_SELECTION.INITIAL_MEMBER_ID]);
      }
    }
  }, [recipientsAreSubjects, contactName]);

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
    setRecipientsAreSubjects(checked);
    if (checked) {
      setSubjectMemberIds([]);
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

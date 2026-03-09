import { useMemo } from "react";
import { Contact } from "@/types/messages";
import { loadTemplateContent } from "@/utils/template-loader";
import { substituteTemplate } from "@/utils/template-substitution";
import { getBeforeOrAfterChurch } from "@/utils/time-utils";
import {
  formatAppointmentDate,
  formatTimeForDisplay,
} from "@/utils/date-formatters";
import { formatNameList } from "@/utils/grammar";
import { formatMemberDisplayNames } from "@/utils/format-member-display";
import members from "@/data/members.json";
import { Member } from "@/utils/format-member-display";

const memberData = members as Member[];

interface UseTemplatePreviewOptions {
  selectedTemplateId?: string;
  selectedTime: string;
  recipientMemberIds: number[];
  subjectMemberIds: number[];
  recipientsAreSubjects: boolean;
  contact: Contact;
}

function extractFirstName(name: string): string {
  const parts = name.split(",");
  if (parts.length > 1) {
    return parts[1].trim();
  }
  const nameParts = name.split(" ");
  return nameParts[0];
}

function formatFirstNames(memberIds: number[]): string {
  const members = memberData.filter((m) => memberIds.includes(m.id));
  const firstNames = members.map((m) => extractFirstName(m.name));
  return formatNameList(firstNames);
}

export function useTemplatePreview({
  selectedTemplateId,
  selectedTime,
  recipientMemberIds,
  subjectMemberIds,
  recipientsAreSubjects,
  contact,
}: UseTemplatePreviewOptions) {
  const appointmentType =
    contact.kind === "calling"
      ? (contact as any).calling
      : (contact as any).labels?.name;

  return useMemo(() => {
    if (!selectedTemplateId) {
      return "";
    }

    const beforeOrAfterChurch = getBeforeOrAfterChurch(selectedTime);

    const recipientMembers = memberData.filter((m) =>
      (recipientMemberIds || []).includes(m.id),
    );
    const subjectMembers = memberData.filter((m) =>
      (subjectMemberIds || []).includes(m.id),
    );

    const formattedRecipients = formatMemberDisplayNames(recipientMembers);
    const recipientNameVariable = formattedRecipients.join(" & ");

    let formattedSubjects: string;
    let pronoun: string;
    let possessive: string;
    let verb: string;

    const effectiveSubjectCount = subjectMembers.length;

    if (recipientsAreSubjects && recipientMembers.length > 0) {
      formattedSubjects = recipientMembers.length === 1 ? "you" : "you all";
      pronoun = "you";
      possessive = "your";
      verb = "are";
    } else if (subjectMembers.length === 1) {
      formattedSubjects = extractFirstName(subjectMembers[0].name);
      const gender = subjectMembers[0].gender;
      pronoun = gender === "M" ? "he" : gender === "F" ? "she" : "they";
      possessive = gender === "M" ? "his" : gender === "F" ? "hers" : "their";
      verb = "is";
    } else if (subjectMembers.length > 1) {
      formattedSubjects = formatFirstNames(subjectMemberIds);
      pronoun = "they";
      possessive = "their";
      verb = "are";
    } else {
      formattedSubjects = "";
      pronoun = "";
      possessive = "";
      verb = "";
    }

    const templateVars = {
      name: recipientNameVariable,
      greeting: recipientNameVariable,
      appointmentType,
      appointmentSummary: appointmentType,
      date: formatAppointmentDate(),
      "before-or-after-church": beforeOrAfterChurch,
      time: formatTimeForDisplay(selectedTime),
      recipients: recipientNameVariable,
      subjects: formattedSubjects,
      pronoun,
      possessive,
      verb,
    };

    return substituteTemplate(
      loadTemplateContent(selectedTemplateId),
      templateVars,
    );
  }, [
    selectedTemplateId,
    selectedTime,
    recipientMemberIds,
    subjectMemberIds,
    recipientsAreSubjects,
    contact,
    appointmentType,
  ]);
}

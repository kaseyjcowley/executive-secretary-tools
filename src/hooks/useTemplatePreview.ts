import { useMemo } from "react";
import { Contact } from "@/types/messages";
import { loadTemplateContent } from "@/utils/template-loader";
import { substituteTemplate } from "@/utils/template-substitution";
import { getBeforeOrAfterChurch } from "@/utils/time-utils";
import {
  formatAppointmentDate,
  formatTimeForDisplay,
} from "@/utils/date-formatters";
import { formatNameList, getPossessive } from "@/utils/grammar";
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
    const firstName = parts[1].trim().split(" ")[0];
    return firstName;
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
      verb = recipientMembers.length === 1 ? "is" : "are";
    } else if (subjectMembers.length === 1) {
      formattedSubjects = extractFirstName(subjectMembers[0].name);
      pronoun =
        subjectMembers[0].gender === "M"
          ? "he"
          : subjectMembers[0].gender === "F"
            ? "she"
            : "they";
      possessive = getPossessive(formattedSubjects);
      verb = "is";
    } else if (subjectMembers.length > 1) {
      formattedSubjects = formatFirstNames(subjectMemberIds);
      pronoun = "they";
      possessive = getPossessive(formattedSubjects);
      verb = "are";
    } else {
      formattedSubjects = "";
      pronoun = "";
      possessive = "";
      verb = "";
    }

    const schedulingPhrase =
      recipientsAreSubjects && recipientMembers.length > 0
        ? "If you would like to get on our schedule to renew"
        : subjectMembers.length === 1
          ? subjectMembers[0].gender === "M"
            ? "If you would like to get him on our schedule to renew"
            : subjectMembers[0].gender === "F"
              ? "If you would like to get her on our schedule to renew"
              : "If you would like to get them on our schedule to renew"
          : "If you would like to get them on our schedule to renew";

    const setApartPhrase =
      recipientsAreSubjects && recipientMembers.length > 0
        ? "to be set apart for your new calling"
        : subjectMembers.length === 1
          ? `to set apart ${formattedSubjects} for ${
              subjectMembers[0].gender === "M"
                ? "his"
                : subjectMembers[0].gender === "F"
                  ? "her"
                  : "their"
            } new calling`
          : `to set apart ${formattedSubjects} for their new callings`;

    const templateVars = {
      name: recipientNameVariable,
      greeting: recipientNameVariable,
      recipients: recipientNameVariable,
      appointmentType,
      appointmentSummary: appointmentType,
      date: formatAppointmentDate(),
      "before-or-after-church": beforeOrAfterChurch,
      time: formatTimeForDisplay(selectedTime),
      subjects: formattedSubjects,
      pronoun,
      possessive,
      verb,
      schedulingPhrase,
      recommendPhrase:
        verb === "are"
          ? "temple recommends expire"
          : "temple recommend expires",
      setApartPhrase,
      calling: appointmentType,
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

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

interface UseTemplatePreviewOptions {
  selectedTemplateId?: string;
  selectedTime: string;
  nameVariable: string;
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

export function useTemplatePreview({
  selectedTemplateId,
  selectedTime,
  nameVariable,
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
    const subjectFirstName = extractFirstName(contact.name);
    const verb = "is";

    const templateVars = {
      name: nameVariable,
      greeting: nameVariable,
      appointmentType,
      appointmentSummary: appointmentType,
      date: formatAppointmentDate(),
      "before-or-after-church": beforeOrAfterChurch,
      time: formatTimeForDisplay(selectedTime),
      recipients: nameVariable,
      subjects: subjectFirstName,
      verb,
    };

    return substituteTemplate(
      loadTemplateContent(selectedTemplateId),
      templateVars,
    );
  }, [
    selectedTemplateId,
    selectedTime,
    nameVariable,
    contact,
    appointmentType,
  ]);
}

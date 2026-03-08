import { useMemo } from "react";
import { Contact } from "@/types/messages";
import { loadTemplateContent } from "@/utils/template-loader";
import { substituteTemplate } from "@/utils/template-substitution";
import { getBeforeOrAfterChurch } from "@/utils/time-utils";
import {
  formatAppointmentDate,
  formatTimeForDisplay,
} from "@/utils/date-formatters";

interface UseTemplatePreviewOptions {
  selectedTemplateId?: string;
  selectedTime: string;
  nameVariable: string;
  contact: Contact;
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

    const templateVars = {
      name: nameVariable,
      greeting: nameVariable,
      appointmentType,
      appointmentSummary: appointmentType,
      date: formatAppointmentDate(),
      "before-or-after-church": beforeOrAfterChurch,
      time: formatTimeForDisplay(selectedTime),
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

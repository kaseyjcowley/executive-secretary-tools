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
  return useMemo(() => {
    if (!selectedTemplateId) {
      return "";
    }

    const beforeOrAfterChurch = getBeforeOrAfterChurch(selectedTime);

    return substituteTemplate(loadTemplateContent(selectedTemplateId), {
      name: nameVariable,
      appointmentType:
        contact.kind === "calling" ? contact.calling : contact.labels?.name,
      date: formatAppointmentDate(),
      "before-or-after-church": beforeOrAfterChurch,
      time: formatTimeForDisplay(selectedTime),
    });
  }, [selectedTemplateId, selectedTime, nameVariable, contact]);
}

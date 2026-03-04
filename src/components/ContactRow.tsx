"use client";

import { useMemo, useState } from "react";
import members from "@/data/members.json";
import { Contact, MessageType } from "@/types/messages";
import { useMemberSelection } from "@/hooks/useMemberSelection";
import {
  getAvailableMessageTypes,
  loadTemplateContent,
} from "@/utils/template-loader";
import { substituteTemplate } from "@/utils/template-substitution";
import { formatMemberDisplayNames } from "@/utils/format-member-display";
import { getBeforeOrAfterChurch } from "@/utils/time-utils";
import { format, isSunday, parse, startOfTomorrow } from "date-fns";
import { ContactInfo, ContactLabels } from "@/components/ContactInfo";
import { MemberSelector } from "@/components/MemberSelector";
import { TemplateSelector } from "@/components/TemplateSelector";
import { TimeSelector } from "@/components/TimeSelector";
import { MessagePreview } from "@/components/MessagePreview";
import { CHURCH_END_TIME } from "@/constants";

interface Props {
  contact: Contact;
  // Optional template to pre-select when component mounts
  initialTemplateId?: string;
}

// Main container component that orchestrates member selection, template choice,
// time selection, and message preview for a single contact row.
export const ContactRow = ({ contact, initialTemplateId }: Props) => {
  // Selected template from the dropdown (e.g., "ward missionary", "home teacher")
  const [selectedTemplateId, setSelectedTemplateId] =
    useState(initialTemplateId);

  // Selected appointment time (defaults to 12:30 PM)
  const [selectedTime, setSelectedTime] = useState(CHURCH_END_TIME);

  // Handles member selection state: which members are assigned, adding/removing/changing
  const { selectedMemberIds, addMember, removeMember, changeMember } =
    useMemberSelection(contact.name);

  // All available message templates loaded from the templates directory
  const messageTypes = getAvailableMessageTypes();

  // Group templates by category for the dropdown select element
  const categories: Record<string, MessageType[]> = useMemo(
    () => ({
      calling: messageTypes.filter((m) => m.category === "calling"),
      interview: messageTypes.filter((m) => m.category === "interview"),
    }),
    [messageTypes],
  );

  // Full member objects for currently selected member IDs
  const selectedMembers = useMemo(
    () => members.filter((m) => selectedMemberIds.includes(m.id)),
    [selectedMemberIds],
  );

  // Formatted display names with appropriate titles (Brother/Sister)
  const displayNames = useMemo(
    () => formatMemberDisplayNames(selectedMembers),
    [selectedMembers],
  );

  // Combine multiple member names for template substitution
  const nameVariable = displayNames.join(" & ");

  // Extract phone numbers from selected members for SMS link
  const phoneNumbers = useMemo(() => {
    return selectedMembers.map((m) => m.phone).filter((p): p is string => !!p);
  }, [selectedMembers]);

  // Determines if selected time is before or after church meetings end
  const beforeOrAfterChurch = getBeforeOrAfterChurch(selectedTime);

  // Renders the template with all substituted variables
  const templatePreview = selectedTemplateId
    ? substituteTemplate(loadTemplateContent(selectedTemplateId), {
        name: nameVariable,
        // For callings, use the calling name; for interviews, use the label name
        appointmentType:
          contact.kind === "calling" ? contact.calling : contact.labels?.name,
        // Display "tomorrow" if the appointment is Sunday, otherwise "Sunday"
        date: isSunday(startOfTomorrow()) ? "tomorrow" : "Sunday",
        // "before church" or "after church" based on selected time
        "before-or-after-church": beforeOrAfterChurch,
        // Format time in 12-hour format (e.g., "2:30 PM")
        time: format(parse(selectedTime, "HH:mm", new Date()), "h:mm a"),
      })
    : "";

  return (
    <div className="border border-slate-300 p-4 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="space-y-3 w-full">
          {/* Contact name and calling/label assignment */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <ContactInfo contact={contact} />
            <ContactLabels contact={contact} />
            <MemberSelector
              selectedMemberIds={selectedMemberIds}
              onAddMember={addMember}
              onRemoveMember={removeMember}
              onChangeMember={changeMember}
            />
          </div>

          {/* Template and time selection dropdowns */}
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <TemplateSelector
              selectedTemplateId={selectedTemplateId}
              onChange={setSelectedTemplateId}
              categories={categories}
            />
            <TimeSelector
              selectedTime={selectedTime}
              onChange={setSelectedTime}
            />
          </div>
        </div>

        {/* Live preview of the composed message with SMS link */}
        <MessagePreview
          templatePreview={templatePreview}
          phoneNumbers={phoneNumbers}
        />
      </div>
    </div>
  );
};

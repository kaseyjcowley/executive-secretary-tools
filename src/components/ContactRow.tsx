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
  initialTemplateId?: string;
  isSelected?: boolean;
  onSelect?: (contactId: string, selected: boolean) => void;
  isInGroup?: boolean;
}

// Main container component that orchestrates member selection, template choice,
// time selection, and message preview for a single contact row.
export const ContactRow = ({
  contact,
  initialTemplateId,
  isSelected,
  onSelect,
  isInGroup,
}: Props) => {
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-4">
        {/* Left Section */}
        <div className="grid grid-rows-2 gap-2">
          {/* Row 1: checkbox, name, member selector */}
          <div className="flex flex-row gap-3 items-start">
            <div className="pt-1">
              <input
                type="checkbox"
                checked={isSelected ?? false}
                onChange={(e) => onSelect?.(contact.name, e.target.checked)}
                disabled={isInGroup}
                title={isInGroup ? "Already part of a group" : undefined}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="flex-shrink-0 pt-0.5">
              <ContactInfo contact={contact} />
            </div>
            <div className="flex-shrink-0 pt-0.5">
              <ContactLabels contact={contact} />
            </div>
            <div className="flex-grow">
              <MemberSelector
                selectedMemberIds={selectedMemberIds}
                onAddMember={addMember}
                onRemoveMember={removeMember}
                onChangeMember={changeMember}
              />
            </div>
          </div>

          {/* Row 2: template selector, time selector */}
          <div className="flex flex-row gap-3 items-start">
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

        {/* Right Section: Message Preview */}
        <div className="flex justify-self-end">
          <MessagePreview
            templatePreview={templatePreview}
            phoneNumbers={phoneNumbers}
          />
        </div>
      </div>
    </div>
  );
};

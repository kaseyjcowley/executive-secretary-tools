"use client";

import { useMemo, useState } from "react";
import members from "@/data/members.json";
import { Contact, MessageType } from "@/types/messages";
import { useMemberSelection } from "@/hooks/useMemberSelection";
import { useTemplatePreview } from "@/hooks/useTemplatePreview";
import { getAvailableMessageTypes } from "@/utils/template-loader";
import { formatMemberDisplayNames } from "@/utils/format-member-display";
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

  // Renders the template with all substituted variables
  const templatePreview = useTemplatePreview({
    selectedTemplateId,
    selectedTime,
    nameVariable,
    contact,
  });

  return (
    <div className="border border-slate-300 p-2 md:p-4 overflow-hidden">
      {/* Outer row: 2/3 left, 1/3 right on desktop, stacks on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] md:grid-rows-4 gap-2 md:gap-4">
        {/* Left Section: three sub-rows */}
        <div className="grid grid-rows-[auto_auto_auto] gap-2 md:row-start-1 md:row-end-4">
          {/* Sub-row 1: checkbox, contact name */}
          <div className="grid grid-cols-[auto_auto] gap-2 md:gap-3 justify-start">
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
            {/* Contact name with label as tagline */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900 break-words">
                {contact.kind === "calling"
                  ? `${contact.name} as ${contact.calling}`
                  : contact.name}
              </h3>
              <ContactLabels contact={contact} />
            </div>
          </div>

          {/* Sub-row 2: member selector (full width) */}
          <div className="grid grid-cols-1">
            <div className="min-w-[120px]">
              <MemberSelector
                selectedMemberIds={selectedMemberIds}
                onAddMember={addMember}
                onRemoveMember={removeMember}
                onChangeMember={changeMember}
              />
            </div>
          </div>

          {/* Sub-row 3: template selector, time selector */}
          <div className="grid grid-cols-[auto_auto] gap-2 md:gap-3 justify-start">
            <div className="min-w-[150px]">
              <TemplateSelector
                selectedTemplateId={selectedTemplateId}
                onChange={setSelectedTemplateId}
                categories={categories}
              />
            </div>
            <div>
              <TimeSelector
                selectedTime={selectedTime}
                onChange={setSelectedTime}
              />
            </div>
          </div>
        </div>

        {/* Right Section: Message Preview - fills full height */}
        <div className="grid md:row-start-1 md:row-span-4">
          <div className="min-h-full">
            <MessagePreview
              templatePreview={templatePreview}
              phoneNumbers={phoneNumbers}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

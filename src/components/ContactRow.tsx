"use client";

import { useMemo, useState } from "react";
import { Contact, MessageType } from "@/types/messages";
import { useRecipientSubjectSelection } from "@/hooks/useRecipientSubjectSelection";
import { useTemplatePreview } from "@/hooks/useTemplatePreview";
import { getAvailableMessageTypes } from "@/utils/template-loader";
import {
  ContactInfo,
  ContactLabels,
  ContactTypeBadge,
} from "@/components/ContactInfo";
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

export const ContactRow = ({
  contact,
  initialTemplateId,
  isSelected,
  onSelect,
  isInGroup,
}: Props) => {
  const [selectedTemplateId, setSelectedTemplateId] =
    useState(initialTemplateId);

  const [selectedTime, setSelectedTime] = useState(CHURCH_END_TIME);

  const {
    recipientMemberIds,
    subjectMemberIds,
    recipientsAreSubjects,
    setRecipientsAreSubjects,
    addRecipient,
    removeRecipient,
    changeRecipient,
    addSubject,
    removeSubject,
    changeSubject,
    recipientPhoneNumbers,
  } = useRecipientSubjectSelection({
    contactName: contact.name,
    defaultRecipientsAreSubjects: true,
  });

  const messageTypes = getAvailableMessageTypes();

  const categories: Record<string, MessageType[]> = useMemo(
    () => ({
      calling: messageTypes.filter((m) => m.category === "calling"),
      interview: messageTypes.filter((m) => m.category === "interview"),
    }),
    [messageTypes],
  );

  const phoneNumbers = recipientsAreSubjects
    ? recipientPhoneNumbers
    : recipientPhoneNumbers;

  const templatePreview = useTemplatePreview({
    selectedTemplateId,
    selectedTime,
    recipientMemberIds,
    subjectMemberIds,
    recipientsAreSubjects,
    contact,
  });

  const isCalling = contact.kind === "calling";

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 border-t-4 p-4 md:p-6 overflow-hidden hover:shadow-md transition-shadow duration-200 ${
        isCalling ? "border-t-purple-500" : "border-t-blue-500"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] md:grid-rows-4 gap-2 md:gap-4">
        <div className="grid grid-rows-[auto_auto_auto] gap-2 md:row-start-1 md:row-end-4">
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
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 break-words">
                {contact.kind === "calling"
                  ? `${contact.name} as ${contact.calling}`
                  : contact.name}
              </h3>
              <div className="flex flex-wrap gap-2 mt-1">
                <ContactTypeBadge contact={contact} />
                <ContactLabels contact={contact} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="min-w-[120px]">
              <span className="text-xs text-gray-500 block mb-1 font-medium">
                Recipient:
              </span>
              <MemberSelector
                selectedMemberIds={recipientMemberIds}
                onAddMember={addRecipient}
                onRemoveMember={removeRecipient}
                onChangeMember={changeRecipient}
                maxMembers={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={recipientsAreSubjects}
                  onChange={(e) => setRecipientsAreSubjects(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                Recipients are subjects
              </label>
            </div>

            {!recipientsAreSubjects && (
              <div className="min-w-[120px]">
                <span className="text-xs text-gray-500 block mb-1 font-medium">
                  Subject:
                </span>
                <MemberSelector
                  selectedMemberIds={subjectMemberIds}
                  onAddMember={addSubject}
                  onRemoveMember={removeSubject}
                  onChangeMember={changeSubject}
                  maxMembers={10}
                />
              </div>
            )}
          </div>

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

"use client";

import { useMemo, useState, useCallback } from "react";
import { Contact, MessageType, MessageScenario } from "@/types/messages";
import { useRecipientSubjectSelection } from "@/features/messages/hooks/useRecipientSubjectSelection";
import { useMessagePreview } from "@/features/messages/hooks/useMessagePreview";
import { getAvailableMessageTypes } from "@/features/messages/utils/template-loader";
import { classifyScenario } from "@/features/messages/utils/message-generator";
import {
  formatMemberDisplayNames,
  Member,
} from "@/utils/format-member-display";
import members from "@/data/members.json";
import { CHURCH_END_TIME, MEMBER_SELECTION } from "@/constants";
import { getBeforeOrAfterChurch } from "@/lib/utils/time-utils";
import { formatTimeForDisplay } from "@/lib/utils/date-formatters";
import { ContactRowHeader } from "./ContactRowHeader";
import { ContactMemberSelector } from "./ContactMemberSelector";
import { ContactTemplateSelector } from "./ContactTemplateSelector";
import { ContactPreview } from "./ContactPreview";

const memberData = members as Member[];

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
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialTemplateId || "",
  );

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

  const validRecipients = useMemo(
    () =>
      recipientMemberIds.filter(
        (id) => id !== MEMBER_SELECTION.INITIAL_MEMBER_ID,
      ),
    [recipientMemberIds],
  );
  const validSubjects = useMemo(
    () =>
      subjectMemberIds.filter(
        (id) => id !== MEMBER_SELECTION.INITIAL_MEMBER_ID,
      ),
    [subjectMemberIds],
  );

  const canShowPreview = Boolean(
    selectedTemplateId && (recipientsAreSubjects || validSubjects.length > 0),
  );

  const canGenerate = Boolean(
    canShowPreview &&
      (recipientsAreSubjects || validSubjects.length > 0) &&
      (recipientsAreSubjects ? validRecipients.length > 0 : true),
  );

  const buildScenario = useCallback((): MessageScenario | null => {
    if (!canGenerate) return null;

    const recipientMembers = memberData.filter((m) =>
      validRecipients.includes(m.id),
    );
    const subjectMembers = recipientsAreSubjects
      ? recipientMembers
      : memberData.filter((m) => validSubjects.includes(m.id));

    const createContact = (name: string, gender?: string): Contact => {
      const contact = {
        name,
        gender,
        kind: "interview" as const,
        labels: { id: selectedTemplateId, name: selectedTemplateId },
        due: "",
        idMembers: "",
        assigned: undefined,
      };
      return contact as Contact;
    };

    const recipients = recipientMembers.map((m) =>
      createContact(m.name, m.gender),
    );
    const subjects = subjectMembers.map((m) => createContact(m.name, m.gender));

    const beforeOrAfterChurch = getBeforeOrAfterChurch(selectedTime);
    const formattedTime = formatTimeForDisplay(selectedTime);

    return {
      type: classifyScenario(recipients, subjects),
      recipients,
      subjects,
      appointmentTypes: new Map([[selectedTemplateId, subjects]]),
      recipientsAreSubjects,
      selectedTime: formattedTime,
      beforeOrAfterChurch,
    };
  }, [
    canGenerate,
    validRecipients,
    validSubjects,
    recipientsAreSubjects,
    selectedTemplateId,
    selectedTime,
  ]);

  const { templatePreview, isLoadingPreview, generatePreview } =
    useMessagePreview({
      buildScenario,
      resetDependencies: [
        canShowPreview,
        validRecipients,
        validSubjects,
        recipientsAreSubjects,
        selectedTemplateId,
      ],
    });

  const isCalling = contact.kind === "calling";

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 border-t-4 p-4 md:p-6 overflow-hidden transition-all duration-200 ${
        isCalling ? "border-t-purple-500" : "border-t-blue-500"
      } ${isSelected ? "ring-2 ring-blue-500 ring-offset-2 shadow-md scale-[1.01]" : "hover:shadow-md hover:-translate-y-0.5"}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] md:grid-rows-4 gap-2 md:gap-4">
        <div className="grid grid-rows-[auto_auto_auto] gap-2 md:row-start-1 md:row-end-4">
          <ContactRowHeader
            contact={contact}
            isSelected={isSelected}
            isInGroup={isInGroup}
            onSelect={onSelect}
          />

          <ContactMemberSelector
            recipientMemberIds={recipientMemberIds}
            subjectMemberIds={subjectMemberIds}
            recipientsAreSubjects={recipientsAreSubjects}
            onRecipientsAreSubjectsChange={setRecipientsAreSubjects}
            onAddRecipient={addRecipient}
            onRemoveRecipient={removeRecipient}
            onChangeRecipient={changeRecipient}
            onAddSubject={addSubject}
            onRemoveSubject={removeSubject}
            onChangeSubject={changeSubject}
          />

          <ContactTemplateSelector
            selectedTemplateId={selectedTemplateId}
            selectedTime={selectedTime}
            categories={categories}
            onTemplateChange={setSelectedTemplateId}
            onTimeChange={setSelectedTime}
          />
        </div>

        <div className="grid md:row-start-1 md:row-span-4">
          <ContactPreview
            canGenerate={canGenerate}
            templatePreview={templatePreview}
            isLoadingPreview={isLoadingPreview}
            phoneNumbers={phoneNumbers}
            validRecipientsCount={validRecipients.length}
            onGeneratePreview={generatePreview}
          />
        </div>
      </div>
    </div>
  );
};

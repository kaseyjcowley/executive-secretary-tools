"use client";

import { useMemo, useState, useEffect } from "react";
import { Contact, MessageType, MessageScenario } from "@/types/messages";
import { useRecipientSubjectSelection } from "@/hooks/useRecipientSubjectSelection";
import { getAvailableMessageTypes } from "@/utils/template-loader";
import { classifyScenario, generateMessage } from "@/utils/message-generator";
import {
  formatMemberDisplayNames,
  Member,
} from "@/utils/format-member-display";
import members from "@/data/members.json";
import {
  ContactInfo,
  ContactLabels,
  ContactTypeBadge,
} from "@/components/ContactInfo";
import { MemberSelector } from "@/components/MemberSelector";
import { TemplateSelector } from "@/components/TemplateSelector";
import { TimeSelector } from "@/components/TimeSelector";
import { MessagePreview } from "@/components/MessagePreview";
import { CHURCH_END_TIME, MEMBER_SELECTION } from "@/constants";
import { getBeforeOrAfterChurch } from "@/utils/time-utils";
import { formatTimeForDisplay } from "@/utils/date-formatters";

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

  const [templatePreview, setTemplatePreview] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

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

  const canShowPreview =
    selectedTemplateId && (recipientsAreSubjects || validSubjects.length > 0);

  const canGenerate =
    canShowPreview &&
    (recipientsAreSubjects || validSubjects.length > 0) &&
    (recipientsAreSubjects ? validRecipients.length > 0 : true);

  const generatePreview = () => {
    if (!canGenerate) return;

    const controller = new AbortController();
    setIsLoadingPreview(true);

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

    const scenario: MessageScenario = {
      type: classifyScenario(recipients, subjects),
      recipients,
      subjects,
      appointmentTypes: new Map([[selectedTemplateId, subjects]]),
      recipientsAreSubjects,
      selectedTime: formattedTime,
      beforeOrAfterChurch,
    };

    generateMessage(scenario, controller.signal)
      .then((message) => {
        if (message) {
          setTemplatePreview(message);
        }
        setIsLoadingPreview(false);
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error generating message:", error);
          setTemplatePreview("Unable to generate message. Please try again.");
        }
        setIsLoadingPreview(false);
      });
  };

  useEffect(() => {
    setTemplatePreview("");
    setIsLoadingPreview(false);
  }, [
    canShowPreview,
    validRecipients,
    validSubjects,
    recipientsAreSubjects,
    selectedTemplateId,
  ]);

  const isCalling = contact.kind === "calling";

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 border-t-4 p-4 md:p-6 overflow-hidden transition-all duration-200 ${
        isCalling ? "border-t-purple-500" : "border-t-blue-500"
      } ${isSelected ? "ring-2 ring-blue-500 ring-offset-2 shadow-md scale-[1.01]" : "hover:shadow-md hover:-translate-y-0.5"}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] md:grid-rows-4 gap-4 md:gap-4">
        <div className="grid grid-rows-[auto_auto_auto] gap-3 md:row-start-1 md:row-end-4">
          <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
            <div className="pt-1">
              <input
                type="checkbox"
                checked={isSelected ?? false}
                onChange={(e) => onSelect?.(contact.name, e.target.checked)}
                disabled={isInGroup}
                title={isInGroup ? "Already part of a group" : undefined}
                className="w-6 h-6 md:w-5 md:h-5 accent-blue-600 cursor-pointer rounded border-gray-300 hover:ring-2 hover:ring-blue-300 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg md:text-base font-semibold text-gray-900 break-words">
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
              <span className="text-sm text-gray-500 block mb-1.5 md:mb-1 font-medium">
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
              <label className="flex items-center gap-2 text-sm text-gray-700 py-1">
                <input
                  type="checkbox"
                  checked={recipientsAreSubjects}
                  onChange={(e) => setRecipientsAreSubjects(e.target.checked)}
                  className="w-5 h-5 md:w-4 md:h-4 accent-blue-600"
                />
                Recipients are subjects
              </label>
            </div>

            {!recipientsAreSubjects && (
              <div className="min-w-[120px]">
                <span className="text-sm text-gray-500 block mb-1.5 md:mb-1 font-medium">
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

          <div className="mt-2 md:mt-4 grid grid-cols-1 sm:grid-cols-[auto_auto] gap-3 justify-start">
            <div className="min-w-[150px]">
              <TemplateSelector
                selectedTemplateId={selectedTemplateId}
                onChange={setSelectedTemplateId}
                categories={categories}
              />
            </div>
            <div className="sm:mt-0">
              <TimeSelector
                selectedTime={selectedTime}
                onChange={setSelectedTime}
              />
            </div>
          </div>
        </div>

        <div className="grid md:row-start-1 md:row-span-4">
          <div className="min-h-full mt-4 md:mt-0">
            {canGenerate && !templatePreview && !isLoadingPreview && (
              <button
                onClick={generatePreview}
                className="w-full mb-3 md:mb-2 px-4 py-3 md:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base md:text-sm font-medium min-h-[44px]"
              >
                Generate Message
              </button>
            )}
            <MessagePreview
              templatePreview={templatePreview}
              phoneNumbers={phoneNumbers}
              isReady={validRecipients.length > 0}
              isLoading={isLoadingPreview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

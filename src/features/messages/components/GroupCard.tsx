"use client";

import { useMemo, useCallback } from "react";
import members from "@/data/members.json";
import {
  Contact,
  ContactGroup,
  MessageType,
  MessageScenario,
} from "@/types/messages";
import { getAvailableMessageTypes } from "@/features/messages/utils/template-loader";
import { classifyScenario } from "@/features/messages/utils/message-generator";
import {
  formatMemberDisplayNames,
  Member,
} from "@/utils/format-member-display";
import { useGroupRecipients } from "@/features/messages/hooks/useGroupRecipients";
import { useGroupSubjects } from "@/features/messages/hooks/useGroupSubjects";
import { useMessagePreview } from "@/features/messages/hooks/useMessagePreview";
import { GroupHeader } from "./GroupHeader";
import { GroupRecipientStep } from "./GroupRecipientStep";
import { GroupSubjectStep } from "./GroupSubjectStep";
import { GroupPreview } from "./GroupPreview";

interface GroupCardProps {
  group: ContactGroup;
  contacts: Contact[];
  onUnmerge: (groupId: string) => void;
}

const memberData = members as Member[];

export const GroupCard = ({ group, contacts, onUnmerge }: GroupCardProps) => {
  const groupContacts = useMemo(
    () => contacts.filter((c) => group.memberIds.includes(c.name)),
    [group.memberIds, contacts],
  );

  const groupNames = useMemo(
    () => groupContacts.map((c) => c.name).join(", "),
    [groupContacts],
  );

  const {
    recipientsAreSubjects,
    selectedRecipientMemberIds,
    selectedRecipients,
    recipientPhoneNumbers,
    handleAddRecipient,
    handleRemoveRecipient,
    handleChangeRecipient,
    handleRecipientsAreSubjectsChange,
  } = useGroupRecipients(groupContacts);

  const {
    subjects,
    subjectTemplateMap,
    toggleSubject,
    setTemplateForSubject,
    canShowPreview,
  } = useGroupSubjects();

  const messageTypes = getAvailableMessageTypes();

  const categories: Record<string, MessageType[]> = useMemo(
    () => ({
      calling: messageTypes.filter((m) => m.category === "calling"),
      interview: messageTypes.filter((m) => m.category === "interview"),
    }),
    [messageTypes],
  );

  const canGenerate = canShowPreview;

  const buildScenario = useCallback((): MessageScenario | null => {
    if (!canGenerate) return null;

    const appointmentTypes = new Map<string, Contact[]>();
    subjects.forEach((subject) => {
      const templateId = subjectTemplateMap[subject.name];
      if (templateId) {
        const existing = appointmentTypes.get(templateId) || [];
        appointmentTypes.set(templateId, [...existing, subject]);
      }
    });

    const recipientMembers = selectedRecipients.map((r) => {
      const member = memberData.find((m) => m.name === r.name);
      return member || { id: 0, name: r.name, age: 0, gender: "", phone: "" };
    });
    const formattedRecipientNames = formatMemberDisplayNames(recipientMembers);

    return {
      type: classifyScenario(selectedRecipients, subjects),
      recipients: selectedRecipients,
      subjects,
      appointmentTypes,
      recipientNames: formattedRecipientNames,
      recipientsAreSubjects,
    };
  }, [
    canGenerate,
    subjects,
    subjectTemplateMap,
    selectedRecipients,
    recipientsAreSubjects,
  ]);

  const { templatePreview, isLoadingPreview, generatePreview } =
    useMessagePreview({
      buildScenario,
      resetDependencies: [
        canShowPreview,
        selectedRecipients,
        subjects,
        subjectTemplateMap,
        recipientsAreSubjects,
      ],
    });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-accent-500 p-6 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <GroupHeader
            groupNames={groupNames}
            contacts={groupContacts}
            onUnmerge={() => onUnmerge(group.id)}
          />

          <GroupRecipientStep
            recipientsAreSubjects={recipientsAreSubjects}
            selectedRecipientMemberIds={selectedRecipientMemberIds}
            onRecipientsAreSubjectsChange={handleRecipientsAreSubjectsChange}
            onAddRecipient={handleAddRecipient}
            onRemoveRecipient={handleRemoveRecipient}
            onChangeRecipient={handleChangeRecipient}
          />

          <GroupSubjectStep
            groupContacts={groupContacts}
            subjects={subjects}
            subjectTemplateMap={subjectTemplateMap}
            categories={categories}
            onToggleSubject={toggleSubject}
            onSetTemplateForSubject={setTemplateForSubject}
          />

          <button
            onClick={() => onUnmerge(group.id)}
            className="text-sm text-gray-500 hover:text-gray-700 underline mt-4 hover:no-underline transition-all duration-200"
          >
            Unmerge
          </button>
        </div>

        <div className="flex justify-end">
          <GroupPreview
            canShowPreview={canShowPreview}
            canGenerate={canGenerate}
            templatePreview={templatePreview}
            isLoadingPreview={isLoadingPreview}
            recipientPhoneNumbers={recipientPhoneNumbers}
            selectedRecipientMemberIds={selectedRecipientMemberIds}
            subjects={subjects}
            subjectTemplateMap={subjectTemplateMap}
            recipientsAreSubjects={recipientsAreSubjects}
            onGeneratePreview={generatePreview}
          />
        </div>
      </div>
    </div>
  );
};

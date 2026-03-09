"use client";

import { useMemo } from "react";
import members from "@/data/members.json";
import {
  Contact,
  ContactGroup,
  MessageType,
  MessageScenario,
} from "@/types/messages";
import { getAvailableMessageTypes } from "@/utils/template-loader";
import { classifyScenario, generateMessage } from "@/utils/message-generator";
import {
  formatMemberDisplayNames,
  Member,
} from "@/utils/format-member-display";
import { MemberSelector } from "@/components/MemberSelector";
import { TemplateSelector } from "@/components/TemplateSelector";
import { MessagePreview } from "@/components/MessagePreview";
import { useGroupRecipients } from "@/hooks/useGroupRecipients";
import { useGroupSubjects } from "@/hooks/useGroupSubjects";
import { MEMBER_SELECTION } from "@/constants";
import { IconUsers, IconX } from "@/components/ui/Icons";

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

  const templatePreview = useMemo(() => {
    if (!canShowPreview) {
      return "";
    }

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

    const scenario: MessageScenario = {
      type: classifyScenario(selectedRecipients, subjects),
      recipients: selectedRecipients,
      subjects,
      appointmentTypes,
      recipientNames: formattedRecipientNames,
    };

    return generateMessage(scenario);
  }, [canShowPreview, selectedRecipients, subjects, subjectTemplateMap]);

  const hasCalling = groupContacts.some((c) => c.kind === "calling");
  const hasInterview = groupContacts.some((c) => c.kind === "interview");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-t-4 border-t-accent-500 p-6 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <IconUsers className="w-5 h-5 text-accent-500" />
              <div className="text-lg font-semibold text-gray-900">
                Group: {groupNames}
              </div>
            </div>
            <div className="flex gap-1">
              {hasCalling && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                  Calling
                </span>
              )}
              {hasInterview && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                  Interview
                </span>
              )}
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Step 1: Select Message Recipients
            </label>
            <p className="text-xs text-blue-700 mb-3">
              Who will receive this message?
            </p>

            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={recipientsAreSubjects}
                onChange={(e) =>
                  handleRecipientsAreSubjectsChange(e.target.checked)
                }
                className="w-4 h-4 accent-blue-600 rounded border-blue-300"
              />
              <span className="text-gray-700">
                Recipients are the same as subjects
              </span>
            </label>

            {!recipientsAreSubjects && (
              <div className="ml-6">
                <MemberSelector
                  selectedMemberIds={selectedRecipientMemberIds}
                  onAddMember={handleAddRecipient}
                  onRemoveMember={handleRemoveRecipient}
                  onChangeMember={handleChangeRecipient}
                />
              </div>
            )}
          </div>

          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors duration-200">
            <label className="block text-sm font-semibold text-green-900 mb-2">
              Step 2: Configure Appointment Subjects
            </label>
            <p className="text-xs text-green-700 mb-3">
              Who are the appointments for? Select a template for each.
            </p>
            <div className="space-y-3">
              {groupContacts.map((contact) => (
                <div key={contact.name} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={subjects.some((s) => s.name === contact.name)}
                    onChange={() => toggleSubject(contact)}
                    className="w-4 h-4 accent-green-600 rounded border-green-300"
                  />
                  <span className="flex-1 text-gray-700">{contact.name}</span>
                  {subjects.some((s) => s.name === contact.name) && (
                    <TemplateSelector
                      selectedTemplateId={subjectTemplateMap[contact.name]}
                      onChange={(id) => setTemplateForSubject(contact.name, id)}
                      categories={categories}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onUnmerge(group.id)}
            className="text-sm text-gray-500 hover:text-gray-700 underline mt-4 hover:no-underline transition-all duration-200"
          >
            Unmerge
          </button>
        </div>

        <div className="flex justify-end">
          <div className="w-full">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Message Preview
            </h3>
            {canShowPreview ? (
              <MessagePreview
                templatePreview={templatePreview}
                phoneNumbers={recipientPhoneNumbers}
              />
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 text-sm">
                <p className="font-medium mb-2">
                  Complete the steps above to see preview:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {recipientsAreSubjects ? (
                    subjects.length === 0 && (
                      <li>Select appointment subjects</li>
                    )
                  ) : selectedRecipientMemberIds.filter(
                      (id) => id !== MEMBER_SELECTION.INITIAL_MEMBER_ID,
                    ).length === 0 ? (
                    <li>Select message recipients</li>
                  ) : null}
                  {subjects.length === 0 && (
                    <li>Select appointment subjects</li>
                  )}
                  {subjects.length > 0 &&
                    Object.keys(subjectTemplateMap).length <
                      subjects.length && (
                      <li>Choose templates for all subjects</li>
                    )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

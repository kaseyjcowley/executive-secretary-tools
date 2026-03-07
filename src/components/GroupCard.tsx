"use client";

import { useMemo, useState } from "react";
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
import { MEMBER_SELECTION } from "@/constants";

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

  const [recipientsAreSubjects, setRecipientsAreSubjects] = useState(false);
  const [selectedRecipientMemberIds, setSelectedRecipientMemberIds] = useState<
    number[]
  >([MEMBER_SELECTION.INITIAL_MEMBER_ID]);
  const [subjects, setSubjects] = useState<Contact[]>([]);
  const [subjectTemplateMap, setSubjectTemplateMap] = useState<
    Record<string, string>
  >({});

  const messageTypes = getAvailableMessageTypes();

  const categories: Record<string, MessageType[]> = useMemo(
    () => ({
      calling: messageTypes.filter((m) => m.category === "calling"),
      interview: messageTypes.filter((m) => m.category === "interview"),
    }),
    [messageTypes],
  );

  const selectedRecipients = useMemo(() => {
    if (recipientsAreSubjects) {
      return subjects;
    }
    return memberData
      .filter((m) => selectedRecipientMemberIds.includes(m.id))
      .map((m) => {
        const contact = groupContacts.find((c) => c.name === m.name);
        return contact || ({ name: m.name, kind: "interview" } as Contact);
      });
  }, [
    recipientsAreSubjects,
    subjects,
    selectedRecipientMemberIds,
    groupContacts,
  ]);

  const recipientPhoneNumbers = useMemo(() => {
    if (recipientsAreSubjects) {
      return selectedRecipients
        .map((r) => "phone" in r && r.phone)
        .filter((p): p is string => !!p);
    }
    return memberData
      .filter((m) => selectedRecipientMemberIds.includes(m.id))
      .map((m) => m.phone)
      .filter((p): p is string => !!p);
  }, [recipientsAreSubjects, selectedRecipients, selectedRecipientMemberIds]);

  const canShowPreview = useMemo(() => {
    const hasRecipients = recipientsAreSubjects
      ? subjects.length > 0
      : selectedRecipientMemberIds.filter(
          (id) => id !== MEMBER_SELECTION.INITIAL_MEMBER_ID,
        ).length > 0;

    return (
      hasRecipients &&
      subjects.length > 0 &&
      Object.keys(subjectTemplateMap).length === subjects.length
    );
  }, [
    recipientsAreSubjects,
    subjects,
    subjectTemplateMap,
    selectedRecipientMemberIds,
  ]);

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

  const handleAddRecipient = () => {
    if (selectedRecipientMemberIds.length < MEMBER_SELECTION.MAX_RECIPIENTS) {
      setSelectedRecipientMemberIds([
        ...selectedRecipientMemberIds,
        MEMBER_SELECTION.INITIAL_MEMBER_ID,
      ]);
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setSelectedRecipientMemberIds(
      selectedRecipientMemberIds.filter((_, i) => i !== index),
    );
  };

  const handleChangeRecipient = (
    index: number,
    memberId: number | undefined,
  ) => {
    if (memberId === undefined) {
      setSelectedRecipientMemberIds(
        selectedRecipientMemberIds.filter((_, i) => i !== index),
      );
    } else {
      setSelectedRecipientMemberIds(
        selectedRecipientMemberIds.map((id, i) =>
          i === index ? memberId : id,
        ),
      );
    }
  };

  const toggleSubject = (contact: Contact) => {
    const isSubject = subjects.some((s) => s.name === contact.name);
    if (isSubject) {
      setSubjects(subjects.filter((s) => s.name !== contact.name));
      const newMap = { ...subjectTemplateMap };
      delete newMap[contact.name];
      setSubjectTemplateMap(newMap);
    } else {
      setSubjects([...subjects, contact]);
    }
  };

  const handleRecipientsAreSubjectsChange = (checked: boolean) => {
    setRecipientsAreSubjects(checked);
    if (checked) {
      setSelectedRecipientMemberIds([MEMBER_SELECTION.INITIAL_MEMBER_ID]);
    }
  };

  return (
    <div className="border border-slate-300 p-4 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="text-lg font-semibold text-slate-900 mb-3">
            Group: {groupNames}
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
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
                className="w-4 h-4"
              />
              <span className="text-slate-700">
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

          <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
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
                    className="w-4 h-4"
                  />
                  <span className="flex-1 text-slate-700">{contact.name}</span>
                  {subjects.some((s) => s.name === contact.name) && (
                    <TemplateSelector
                      selectedTemplateId={subjectTemplateMap[contact.name]}
                      onChange={(id) => {
                        setSubjectTemplateMap({
                          ...subjectTemplateMap,
                          [contact.name]: id,
                        });
                      }}
                      categories={categories}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onUnmerge(group.id)}
            className="text-sm text-slate-600 hover:text-slate-800 underline mt-3"
          >
            Unmerge
          </button>
        </div>

        <div className="flex justify-end">
          <div className="w-full">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Message Preview
            </h3>
            {canShowPreview ? (
              <MessagePreview
                templatePreview={templatePreview}
                phoneNumbers={recipientPhoneNumbers}
              />
            ) : (
              <div className="p-4 bg-slate-100 rounded border border-slate-300 text-slate-600 text-sm">
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

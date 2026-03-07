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
import { formatMemberDisplayNames } from "@/utils/format-member-display";
import { classifyScenario, generateMessage } from "@/utils/message-generator";
import { TemplateSelector } from "@/components/TemplateSelector";
import { MessagePreview } from "@/components/MessagePreview";

interface GroupCardProps {
  group: ContactGroup;
  contacts: Contact[];
  onUnmerge: (groupId: string) => void;
}

export const GroupCard = ({ group, contacts, onUnmerge }: GroupCardProps) => {
  const groupContacts = useMemo(
    () => contacts.filter((c) => group.memberIds.includes(c.name)),
    [group.memberIds, contacts],
  );

  const groupNames = useMemo(
    () => groupContacts.map((c) => c.name).join(", "),
    [groupContacts],
  );

  const [recipients, setRecipients] = useState<Contact[]>([]);
  const [subjects, setSubjects] = useState<Contact[]>([]);
  const [subjectTemplateMap, setSubjectTemplateMap] = useState<
    Record<string, string>
  >({});
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

  const messageTypes = getAvailableMessageTypes();

  const categories: Record<string, MessageType[]> = useMemo(
    () => ({
      calling: messageTypes.filter((m) => m.category === "calling"),
      interview: messageTypes.filter((m) => m.category === "interview"),
    }),
    [messageTypes],
  );

  const selectedMembers = useMemo(
    () =>
      members
        .filter((m) => selectedMemberIds.includes(m.id))
        .map((m) => ({
          id: m.id,
          name: m.name,
          age: m.age,
          gender: m.gender,
          phone: m.phone,
        })),
    [selectedMemberIds],
  );

  const phoneNumbers = useMemo(() => {
    return selectedMembers.map((m) => m.phone).filter((p): p is string => !!p);
  }, [selectedMembers]);

  const canShowPreview = useMemo(() => {
    return (
      recipients.length > 0 &&
      recipients.length <= 2 &&
      subjects.length > 0 &&
      Object.keys(subjectTemplateMap).length === subjects.length
    );
  }, [recipients, subjects, subjectTemplateMap]);

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

    const scenario: MessageScenario = {
      type: classifyScenario(recipients, subjects),
      recipients,
      subjects,
      appointmentTypes,
    };

    return generateMessage(scenario);
  }, [canShowPreview, recipients, subjects, subjectTemplateMap]);

  const toggleRecipient = (contact: Contact) => {
    const isRecipient = recipients.some((r) => r.name === contact.name);
    if (isRecipient) {
      setRecipients(recipients.filter((r) => r.name !== contact.name));
    } else {
      if (recipients.length < 2) {
        setRecipients([...recipients, contact]);
      }
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

  const getAppointmentType = (contact: Contact): string => {
    return contact.kind === "calling"
      ? contact.calling
      : contact.labels?.name || "Appointment";
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
              Step 1: Select Message Recipients (max 2)
            </label>
            <p className="text-xs text-blue-700 mb-3">
              Who will receive this message?
            </p>
            <div className="space-y-2">
              {groupContacts.map((contact) => (
                <label
                  key={contact.name}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={recipients.some((r) => r.name === contact.name)}
                    disabled={
                      !recipients.some((r) => r.name === contact.name) &&
                      recipients.length >= 2
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        toggleRecipient(contact);
                      } else {
                        toggleRecipient(contact);
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700">{contact.name}</span>
                </label>
              ))}
            </div>
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
                    onChange={(e) => {
                      toggleSubject(contact);
                    }}
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
                phoneNumbers={phoneNumbers}
              />
            ) : (
              <div className="p-4 bg-slate-100 rounded border border-slate-300 text-slate-600 text-sm">
                <p className="font-medium mb-2">
                  Complete the steps above to see preview:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {recipients.length === 0 && <li>Select 1-2 recipients</li>}
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

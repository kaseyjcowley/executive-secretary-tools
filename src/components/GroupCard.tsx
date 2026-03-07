"use client";

import { useMemo, useState } from "react";
import members from "@/data/members.json";
import { Contact, ContactGroup, MessageType } from "@/types/messages";
import { getAvailableMessageTypes } from "@/utils/template-loader";
import { formatMemberDisplayNames } from "@/utils/format-member-display";
import { generateGroupMessage } from "@/utils/group-message";
import { MemberSelector } from "@/components/MemberSelector";
import { TemplateSelector } from "@/components/TemplateSelector";
import { TimeSelector } from "@/components/TimeSelector";
import { MessagePreview } from "@/components/MessagePreview";
import { CHURCH_END_TIME } from "@/constants";

interface GroupCardProps {
  group: ContactGroup;
  contacts: Contact[];
  onUnmerge: (groupId: string) => void;
}

const INITIAL_MEMBER_ID = -1;

export const GroupCard = ({ group, contacts, onUnmerge }: GroupCardProps) => {
  const groupContacts = useMemo(
    () => contacts.filter((c) => group.memberIds.includes(c.name)),
    [group.memberIds, contacts],
  );

  const groupNames = useMemo(
    () => groupContacts.map((c) => c.name).join(", "),
    [groupContacts],
  );

  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([
    INITIAL_MEMBER_ID,
  ]);
  const [selectedTime, setSelectedTime] = useState(CHURCH_END_TIME);
  const [memberTemplateIds, setMemberTemplateIds] = useState<
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

  const displayNames = useMemo(
    () => formatMemberDisplayNames(selectedMembers),
    [selectedMembers],
  );

  const nameVariable = displayNames.join(" & ");

  const phoneNumbers = useMemo(() => {
    return selectedMembers.map((m) => m.phone).filter((p): p is string => !!p);
  }, [selectedMembers]);

  const getContactTemplateId = (contactName: string): string | undefined => {
    return memberTemplateIds[contactName];
  };

  const handleTemplateChange = (contactName: string, templateId: string) => {
    setMemberTemplateIds((prev) => ({
      ...prev,
      [contactName]: templateId,
    }));
  };

  const getAppointmentType = (contact: Contact): string => {
    return contact.kind === "calling"
      ? contact.calling
      : contact.labels?.name || "Appointment";
  };

  const handleAddMember = () => {
    if (selectedMemberIds.length < 2) {
      setSelectedMemberIds([...selectedMemberIds, INITIAL_MEMBER_ID]);
    }
  };

  const handleRemoveMember = (index: number) => {
    setSelectedMemberIds(selectedMemberIds.filter((_, i) => i !== index));
  };

  const handleChangeMember = (index: number, memberId: number | undefined) => {
    if (memberId === undefined) {
      setSelectedMemberIds(selectedMemberIds.filter((_, i) => i !== index));
    } else {
      setSelectedMemberIds(
        selectedMemberIds.map((id, i) => (i === index ? memberId : id)),
      );
    }
  };

  const templatePreview = useMemo(() => {
    return generateGroupMessage({
      recipientNames: nameVariable,
      time: selectedTime,
      templateIds: memberTemplateIds,
      members: groupContacts,
    });
  }, [nameVariable, selectedTime, memberTemplateIds, groupContacts]);

  return (
    <div className="border border-slate-300 p-4 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Section */}
        <div className="grid grid-rows-[auto_auto] gap-2">
          {/* Row 1: Group title, recipients */}
          <div>
            <div className="text-lg font-semibold text-slate-900 mb-3">
              Group: {groupNames}
            </div>

            <div className="flex flex-row gap-3 items-center mb-3">
              <span className="text-sm text-slate-600 flex-shrink-0">
                Recipients:
              </span>
              <div className="flex-grow">
                <MemberSelector
                  selectedMemberIds={selectedMemberIds}
                  onAddMember={handleAddMember}
                  onRemoveMember={handleRemoveMember}
                  onChangeMember={handleChangeMember}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Time selector, members list with template selectors */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-slate-600 flex-shrink-0">
                Time:
              </span>
              <TimeSelector
                selectedTime={selectedTime}
                onChange={setSelectedTime}
              />
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="text-sm font-medium text-slate-700 mb-2">
                Members:
              </div>
              <div className="space-y-3">
                {groupContacts.map((contact) => (
                  <div key={contact.name} className="flex flex-col gap-1">
                    <span className="text-slate-900">
                      • {contact.name} - {getAppointmentType(contact)}
                    </span>
                    <div className="ml-4">
                      <TemplateSelector
                        selectedTemplateId={getContactTemplateId(contact.name)}
                        onChange={(id) =>
                          handleTemplateChange(contact.name, id)
                        }
                        categories={categories}
                      />
                    </div>
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
        </div>

        {/* Right Section: Message Preview */}
        <div className="flex justify-end">
          <div className="w-[500px]">
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

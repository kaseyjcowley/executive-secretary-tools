"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Contact,
  ContactGroup,
  ContactListItem,
  isContactGroup,
  MessageType,
} from "@/types/messages";
import { getAvailableMessageTypes } from "@/utils/template-loader";
import { ContactRow } from "./ContactRow";
import { GroupCard } from "./GroupCard";
import { MergeToolbar } from "./MergeToolbar";
import { CallingStage } from "@/constants";

interface Props {
  contacts: Contact[];
}

function autoSelectTemplate(
  contact: Contact,
  messageTypes: MessageType[],
): string | undefined {
  if (contact.kind === "calling") {
    return contact.stage === CallingStage.needsCallingExtended
      ? "extend-calling"
      : "setting-apart";
  }

  if (contact.kind === "interview" && contact.labels?.name) {
    const labelName = contact.labels.name.toLowerCase();

    const exactMatch = messageTypes.find(
      (mt) => mt.id === labelName.replace(/\s+/g, "-"),
    );
    if (exactMatch) return exactMatch.id;

    if (labelName.includes("temple")) {
      const templeTemplate = messageTypes.find(
        (mt) => mt.id === "temple-visit",
      );
      if (templeTemplate) return templeTemplate.id;
    }

    if (labelName.includes("welfare")) {
      const welfareTemplate = messageTypes.find(
        (mt) => mt.id === "welfare-meeting",
      );
      if (welfareTemplate) return welfareTemplate.id;
    }

    if (labelName.includes("family")) {
      const familyTemplate = messageTypes.find(
        (mt) => mt.id === "family-council",
      );
      if (familyTemplate) return familyTemplate.id;
    }

    if (labelName.includes("bishop")) {
      const bishopTemplate = messageTypes.find(
        (mt) => mt.id === "bishop-interview",
      );
      if (bishopTemplate) return bishopTemplate.id;
    }

    if (labelName.includes("first counselor")) {
      const firstCounselorTemplate = messageTypes.find(
        (mt) => mt.id === "first-counselor-interview",
      );
      if (firstCounselorTemplate) return firstCounselorTemplate.id;
    }

    if (labelName.includes("second counselor")) {
      const secondCounselorTemplate = messageTypes.find(
        (mt) => mt.id === "second-counselor-interview",
      );
      if (secondCounselorTemplate) return secondCounselorTemplate.id;
    }

    if (labelName.includes("setting apart")) {
      const settingApartTemplate = messageTypes.find(
        (mt) => mt.id === "setting-apart",
      );
      if (settingApartTemplate) return settingApartTemplate.id;
    }

    if (labelName.includes("follow")) {
      const followUpTemplate = messageTypes.find((mt) => mt.id === "follow-up");
      if (followUpTemplate) return followUpTemplate.id;
    }

    const defaultTemplate = messageTypes.find(
      (mt) => mt.id === "interview-reminder",
    );
    if (defaultTemplate) return defaultTemplate.id;
  }

  return undefined;
}

export const ContactList = ({ contacts }: Props) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<ContactGroup[]>([]);

  const groupedContactNames = useMemo(() => {
    return new Set(groups.flatMap((g) => g.memberIds));
  }, [groups]);

  const ungroupedContacts = useMemo(
    () => contacts.filter((c) => !groupedContactNames.has(c.name)),
    [contacts, groupedContactNames],
  );

  const listItems: ContactListItem[] = useMemo(() => {
    const items: ContactListItem[] = [...groups];
    for (const contact of ungroupedContacts) {
      items.push(contact);
    }
    return items;
  }, [groups, ungroupedContacts]);

  const handleSelect = useCallback((contactName: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(contactName);
      } else {
        next.delete(contactName);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allUngroupedNames = ungroupedContacts.map((c) => c.name);
    setSelectedIds(new Set(allUngroupedNames));
  }, [ungroupedContacts]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleMerge = useCallback(() => {
    if (selectedIds.size < 2) return;

    const memberIds = Array.from(selectedIds);
    const newGroup: ContactGroup = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      memberIds,
      createdAt: new Date(),
    };

    setGroups((prev) => [...prev, newGroup]);
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleUnmerge = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  if (!contacts || contacts.length === 0) {
    return <p className="text-slate-900 italic">No contacts to display</p>;
  }

  if (!contacts || contacts.length === 0) {
    return <p className="text-slate-900 italic">No contacts to display</p>;
  }

  return (
    <div>
      {selectedIds.size > 0 && (
        <MergeToolbar
          selectedCount={selectedIds.size}
          onMerge={handleMerge}
          onClearSelection={handleClearSelection}
        />
      )}

      {ungroupedContacts.length > 0 && selectedIds.size === 0 && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  handleSelectAll();
                } else {
                  handleClearSelection();
                }
              }}
              className="w-4 h-4 accent-blue-600"
            />
            Select all ({ungroupedContacts.length} contacts)
          </label>
        </div>
      )}

      <div className="space-y-8">
        {listItems.map((item, index) => {
          if (isContactGroup(item)) {
            return (
              <GroupCard
                key={item.id}
                group={item}
                contacts={contacts}
                onUnmerge={handleUnmerge}
              />
            );
          }

          const contact = item as Contact;
          const isInGroup = groupedContactNames.has(contact.name);
          const isSelected = selectedIds.has(contact.name);

          const initialTemplateId = autoSelectTemplate(
            contact,
            getAvailableMessageTypes(),
          );

          return (
            <ContactRow
              key={contact.name || index}
              contact={contact}
              initialTemplateId={initialTemplateId}
              isSelected={isSelected}
              onSelect={handleSelect}
              isInGroup={isInGroup}
            />
          );
        })}
      </div>
    </div>
  );
};

"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Contact,
  ContactGroup,
  ContactListItem,
  isContactGroup,
} from "@/types/messages";
import { getAvailableMessageTypes } from "@/utils/template-loader";
import { autoSelectTemplate } from "@/utils/template-matcher";
import { ContactRow } from "./ContactRow";
import { GroupCard } from "./GroupCard";
import { MergeToolbar } from "./MergeToolbar";
import { useMessagedContacts } from "@/hooks/useMessagedContacts";
import { showMarkedToast } from "@/components/MarkAsMessagedToast";

interface Props {
  contacts: Contact[];
  suppressedIds?: Set<string>;
}

export const ContactList = ({
  contacts,
  suppressedIds: initialSuppressedIds,
}: Props) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<ContactGroup[]>([]);

  const contactNames = useMemo(() => contacts.map((c) => c.name), [contacts]);
  const { suppressedIds, markAsMessaged, unmarkContact } = useMessagedContacts({
    contactIds: contactNames,
    initialSuppressedIds,
  });

  const visibleContacts = useMemo(
    () => contacts.filter((c) => !suppressedIds.has(c.name)),
    [contacts, suppressedIds],
  );

  const groupedContactNames = useMemo(() => {
    return new Set(groups.flatMap((g) => g.memberIds));
  }, [groups]);

  const ungroupedContacts = useMemo(
    () => visibleContacts.filter((c) => !groupedContactNames.has(c.name)),
    [visibleContacts, groupedContactNames],
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
    const allUngroupedNames = visibleContacts.map((c) => c.name);
    setSelectedIds(new Set(allUngroupedNames));
  }, [visibleContacts]);

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

  const handleMarkAsMessaged = useCallback(async () => {
    const selectedNames = Array.from(selectedIds);

    try {
      await markAsMessaged(selectedNames);
      showMarkedToast({
        contactNames: selectedNames,
        onUndo: async () => {
          try {
            await Promise.all(selectedNames.map((name) => unmarkContact(name)));
          } catch (error) {
            console.error("Error undoing mark:", error);
          }
        },
      });
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Error marking contacts:", error);
    }
  }, [selectedIds, markAsMessaged, unmarkContact]);

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
          onMarkAsMessaged={handleMarkAsMessaged}
        />
      )}

      {visibleContacts.length > 0 && selectedIds.size === 0 && (
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
            Select all ({visibleContacts.length} contacts)
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

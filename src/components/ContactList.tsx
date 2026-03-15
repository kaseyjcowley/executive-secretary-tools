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
import { IconUsers, IconCheck } from "@/components/ui/Icons";

interface Props {
  contacts: Contact[];
  suppressedIds?: Set<string>;
  showMessaged?: boolean;
}

export const ContactList = ({
  contacts,
  suppressedIds: initialSuppressedIds,
  showMessaged = false,
}: Props) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<ContactGroup[]>([]);

  const contactNames = useMemo(() => contacts.map((c) => c.name), [contacts]);
  const { suppressedIds, markAsMessaged, unmarkContact } = useMessagedContacts({
    contactIds: contactNames,
    initialSuppressedIds,
  });

  const visibleContacts = useMemo(
    () =>
      showMessaged
        ? contacts
        : contacts.filter((c) => !suppressedIds.has(c.name)),
    [contacts, suppressedIds, showMessaged],
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
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconUsers className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Contacts Found
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            There are no contacts available for messaging at this time. Check
            back later or add new contacts.
          </p>
        </div>
      </div>
    );
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
        <div className="mb-6 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  handleSelectAll();
                } else {
                  handleClearSelection();
                }
              }}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span className="font-medium">
              Select all ({visibleContacts.length} contacts)
            </span>
          </label>
        </div>
      )}

      {visibleContacts.length === 0 && contacts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCheck className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All Done!
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              You&apos;ve messaged all {contacts.length} contacts. Great job!
            </p>
          </div>
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

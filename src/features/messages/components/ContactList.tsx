"use client";

import { useState, useMemo, useCallback } from "react";
import { MessagesErrorState } from "@/features/messages/components/MessagesErrorState";
import React from "react";
import {
  Contact,
  ContactGroup,
  ContactListItem,
  isContactGroup,
} from "@/types/messages";
import { getAvailableMessageTypes } from "@/features/messages/utils/template-loader";
import { autoSelectTemplate } from "@/features/messages/utils/template-matcher";
import { Card, CardBody, EmptyState } from "@/components/ui";
import { ContactRow } from "./ContactRow";
import { GroupCard } from "./GroupCard";
import { MergeToolbar } from "./MergeToolbar";
import { useMessagedStatus } from "@/features/messages/hooks/useMessagedStatus";
import { showMarkedToast } from "@/features/messages/components/MarkAsMessagedToast";
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
  // Small error boundary to prevent an error inside any child from crashing
  // the entire messages page. We render a friendly ErrorState instead.
  class Boundary extends React.Component<
    { children: React.ReactNode; context?: Record<string, unknown> },
    { hasError: boolean }
  > {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    componentDidCatch(error: unknown, info: React.ErrorInfo) {
      // Log the error, plus the React component stack and some client info
      try {
        console.error("Error in ContactList child:", error);
        console.error("ContactList component stack:", info?.componentStack);
        if (typeof navigator !== "undefined") {
          console.error("User agent:", navigator.userAgent);
        }
        if (typeof window !== "undefined") {
          console.error("Location:", window.location.href);
        }
      } catch (err) {
        // Ensure we never throw from the error handler
        console.error("Error while logging ContactList error:", err);
      }
      // Send structured payload to server-side log endpoint (best-effort)
      try {
        if (typeof window !== "undefined") {
          const payload = {
            error: String(error),
            componentStack: info?.componentStack || null,
            userAgent:
              typeof navigator !== "undefined" ? navigator.userAgent : null,
            location:
              typeof window !== "undefined" ? window.location.href : null,
            timestamp: new Date().toISOString(),
            clientContext: this.props?.context || null,
          } as Record<string, unknown>;

          const body = JSON.stringify(payload);
          // Prefer sendBeacon for reliability during page unloads; fallback to fetch
          if (
            navigator &&
            typeof (navigator as any).sendBeacon === "function"
          ) {
            try {
              (navigator as any).sendBeacon("/api/log-client-error", body);
            } catch (e) {
              // ignore
            }
          } else {
            void fetch("/api/log-client-error", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body,
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error("Failed to POST client error to server:", err);
      }
    }
    render() {
      if (this.state.hasError) {
        return <MessagesErrorState />;
      }
      return this.props.children as React.ReactElement;
    }
  }
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<ContactGroup[]>([]);

  const contactNames = useMemo(() => contacts.map((c) => c.name), [contacts]);
  const { suppressedIds, markAsMessaged, unmarkContact } = useMessagedStatus({
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
      <EmptyState
        icon={<IconUsers className="w-8 h-8 text-gray-400" />}
        title="No Contacts Found"
        description="There are no contacts available for messaging at this time. Check back later or add new contacts."
      />
    );
  }

  const clientContext = {
    visibleContactNames: visibleContacts.map((c) => c.name),
    groups: groups.map((g) => ({ id: g.id, memberIds: g.memberIds })),
    selectedIds: Array.from(selectedIds),
  } as Record<string, unknown>;

  return (
    <Boundary context={clientContext}>
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
          <Card compact className="mb-4">
            <CardBody className="p-1">
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
                  className="w-5 h-5 accent-blue-600 rounded"
                />
                <span className="font-medium">
                  Select all ({visibleContacts.length} contacts)
                </span>
              </label>
            </CardBody>
          </Card>
        )}

        {visibleContacts.length === 0 && contacts.length > 0 && (
          <EmptyState
            icon={
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <IconCheck className="w-8 h-8 text-green-600" />
              </div>
            }
            title="All Done!"
            description={`You've messaged all ${contacts.length} contacts. Great job!`}
          />
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
    </Boundary>
  );
};

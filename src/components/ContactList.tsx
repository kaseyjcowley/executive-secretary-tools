"use client";

import { useState, useEffect } from "react";
import { Contact } from "@/types/messages";
import { ContactRow } from "./ContactRow";
import { sortContactsByLabel } from "@/utils/contact-ordering";

interface MessageType {
  id: string;
  name: string;
  category: "calling" | "interview" | "temple" | "welfare" | "family" | "follow-up";
  templatePath: string;
  content: string;
}

interface Props {
  contacts: Contact[];
}

/**
 * Auto-selects a template based on contact's labels (client-side version).
 * For calling contacts: returns 'calling-acceptance'
 * For interview contacts: returns template ID based on label patterns
 * Returns undefined if no match found.
 */
function autoSelectTemplate(contact: Contact, messageTypes: MessageType[]): string | undefined {
  // Calling contacts always use calling-acceptance
  if (contact.kind === 'calling') {
    return 'calling-acceptance';
  }

  // For interview contacts, look up label in message types
  if (contact.kind === 'interview' && contact.labels?.name) {
    const labelName = contact.labels.name.toLowerCase();

    // Try to find exact match first
    const exactMatch = messageTypes.find(mt => mt.id === labelName.replace(/\s+/g, '-'));
    if (exactMatch) return exactMatch.id;

    // Try to find partial match by keywords
    if (labelName.includes('calling')) {
      const callingTemplate = messageTypes.find(mt => mt.id === 'calling-acceptance');
      if (callingTemplate) return callingTemplate.id;
    }

    if (labelName.includes('temple')) {
      const templeTemplate = messageTypes.find(mt => mt.id === 'temple-visit');
      if (templeTemplate) return templeTemplate.id;
    }

    if (labelName.includes('welfare')) {
      const welfareTemplate = messageTypes.find(mt => mt.id === 'welfare-meeting');
      if (welfareTemplate) return welfareTemplate.id;
    }

    if (labelName.includes('family')) {
      const familyTemplate = messageTypes.find(mt => mt.id === 'family-council');
      if (familyTemplate) return familyTemplate.id;
    }

    if (labelName.includes('bishop')) {
      const bishopTemplate = messageTypes.find(mt => mt.id === 'bishop-interview');
      if (bishopTemplate) return bishopTemplate.id;
    }

    if (labelName.includes('first counselor')) {
      const firstCounselorTemplate = messageTypes.find(mt => mt.id === 'first-counselor-interview');
      if (firstCounselorTemplate) return firstCounselorTemplate.id;
    }

    if (labelName.includes('second counselor')) {
      const secondCounselorTemplate = messageTypes.find(mt => mt.id === 'second-counselor-interview');
      if (secondCounselorTemplate) return secondCounselorTemplate.id;
    }

    if (labelName.includes('setting apart')) {
      const settingApartTemplate = messageTypes.find(mt => mt.id === 'setting-apart');
      if (settingApartTemplate) return settingApartTemplate.id;
    }

    if (labelName.includes('follow')) {
      const followUpTemplate = messageTypes.find(mt => mt.id === 'follow-up');
      if (followUpTemplate) return followUpTemplate.id;
    }

    // Default to interview-reminder for unknown labels
    const defaultTemplate = messageTypes.find(mt => mt.id === 'interview-reminder');
    if (defaultTemplate) return defaultTemplate.id;
  }

  return undefined;
}

export const ContactList = ({ contacts }: Props) => {
  const [messageTypes, setMessageTypes] = useState<MessageType[]>([]);

  // Sort contacts by label priority
  const sortedContacts = sortContactsByLabel(contacts);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/message-types`
    )
      .then((res) => res.json())
      .then((data) => setMessageTypes(data.messageTypes))
      .catch((err) => console.error("Failed to fetch message types:", err));
  }, []);

  if (!contacts || contacts.length === 0) {
    return <p className="text-slate-900 italic">No contacts to display</p>;
  }

  return (
    <div className="space-y-2">
      {sortedContacts.map((contact, index) => {
        const initialTemplateId = autoSelectTemplate(contact, messageTypes);
        return (
          <ContactRow
            key={contact.name || index}
            contact={contact}
            initialTemplateId={initialTemplateId}
            messageTypes={messageTypes}
          />
        );
      })}
    </div>
  );
};

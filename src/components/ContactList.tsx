"use client";

import { Contact } from "@/types/messages";
import { ContactRow } from "./ContactRow";

interface Props {
  contacts: Contact[];
}

export const ContactList = ({ contacts }: Props) => {
  if (!contacts || contacts.length === 0) {
    return <p className="text-slate-900 italic">No contacts to display</p>;
  }

  return (
    <div className="space-y-2">
      {contacts.map((contact, index) => (
        <ContactRow key={contact.name || index} contact={contact} />
      ))}
    </div>
  );
};

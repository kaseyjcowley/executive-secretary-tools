import { Contact } from "@/types/messages";

interface ContactInfoProps {
  contact: Contact;
}

export function ContactInfo({ contact }: ContactInfoProps) {
  return (
    <span className="font-semibold text-slate-900 break-words">
      {contact.kind === "calling"
        ? `${contact.name} as ${contact.calling}`
        : contact.name}
    </span>
  );
}

export function ContactLabels({ contact }: ContactInfoProps) {
  return "labels" in contact && contact.labels?.name ? (
    <span className="text-sm text-slate-600">{contact.labels.name}</span>
  ) : null;
}

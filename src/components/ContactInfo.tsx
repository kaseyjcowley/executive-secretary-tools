import { Contact } from "@/types/messages";

interface ContactInfoProps {
  contact: Contact;
}

export function ContactTypeBadge({ contact }: ContactInfoProps) {
  const isCalling = contact.kind === "calling";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
        isCalling
          ? "bg-purple-100 text-purple-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {isCalling ? "Calling" : "Interview"}
    </span>
  );
}

export function ContactInfo({ contact }: ContactInfoProps) {
  return (
    <span className="font-semibold text-gray-900 break-words">
      {contact.kind === "calling"
        ? `${contact.name} as ${contact.calling}`
        : contact.name}
    </span>
  );
}

export function ContactLabels({ contact }: ContactInfoProps) {
  return "labels" in contact && contact.labels?.name ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mt-1">
      {contact.labels.name}
    </span>
  ) : null;
}

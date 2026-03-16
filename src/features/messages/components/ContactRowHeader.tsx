import { Contact } from "@/types/messages";
import {
  ContactTypeBadge,
  ContactLabels,
} from "@/features/messages/components/ContactInfo";

interface Props {
  contact: Contact;
  isSelected?: boolean;
  isInGroup?: boolean;
  onSelect?: (contactId: string, selected: boolean) => void;
}

export const ContactRowHeader = ({
  contact,
  isSelected,
  isInGroup,
  onSelect,
}: Props) => {
  const isCalling = contact.kind === "calling";

  return (
    <div className="grid grid-cols-[auto_auto] gap-2 md:gap-3 justify-start">
      <div className="pt-1">
        <input
          type="checkbox"
          checked={isSelected ?? false}
          onChange={(e) => onSelect?.(contact.name, e.target.checked)}
          disabled={isInGroup}
          title={isInGroup ? "Already part of a group" : undefined}
          className="w-5 h-5 accent-blue-600 cursor-pointer rounded border-gray-300 hover:ring-2 hover:ring-blue-300 transition-all duration-200"
        />
      </div>
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 break-words">
          {isCalling ? `${contact.name} as ${contact.calling}` : contact.name}
        </h3>
        <div className="flex flex-wrap gap-2 mt-1">
          <ContactTypeBadge contact={contact} />
          <ContactLabels contact={contact} />
        </div>
      </div>
    </div>
  );
};

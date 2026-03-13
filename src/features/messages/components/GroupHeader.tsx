import { Contact } from "@/types/messages";
import { IconUsers } from "@/components/ui/Icons";

interface Props {
  groupNames: string;
  contacts: Contact[];
  onUnmerge: () => void;
}

export const GroupHeader = ({ groupNames, contacts, onUnmerge }: Props) => {
  const hasCalling = contacts.some((c) => c.kind === "calling");
  const hasInterview = contacts.some((c) => c.kind === "interview");

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <IconUsers className="w-5 h-5 text-accent-500" />
        <div className="text-lg font-semibold text-gray-900">
          Group: {groupNames}
        </div>
      </div>
      <div className="flex gap-1">
        {hasCalling && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
            Calling
          </span>
        )}
        {hasInterview && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
            Interview
          </span>
        )}
      </div>
    </div>
  );
};

import { MemberSelector } from "@/features/messages/components/MemberSelector";

interface Props {
  recipientsAreSubjects: boolean;
  selectedRecipientMemberIds: number[];
  onRecipientsAreSubjectsChange: (checked: boolean) => void;
  onAddRecipient: () => void;
  onRemoveRecipient: (index: number) => void;
  onChangeRecipient: (index: number, memberId: number | undefined) => void;
}

export const GroupRecipientStep = ({
  recipientsAreSubjects,
  selectedRecipientMemberIds,
  onRecipientsAreSubjectsChange,
  onAddRecipient,
  onRemoveRecipient,
  onChangeRecipient,
}: Props) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
      <label className="block text-sm font-semibold text-blue-900 mb-2">
        Step 1: Select Message Recipients
      </label>
      <p className="text-xs text-blue-700 mb-3">
        Who will receive this message?
      </p>

      <label className="flex items-center gap-2 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={recipientsAreSubjects}
          onChange={(e) => onRecipientsAreSubjectsChange(e.target.checked)}
          className="w-5 h-5 accent-blue-600 rounded border-blue-300"
        />
        <span className="text-gray-700">
          Recipients are the same as subjects
        </span>
      </label>

      {!recipientsAreSubjects && (
        <div className="ml-6">
          <MemberSelector
            selectedMemberIds={selectedRecipientMemberIds}
            onAddMember={onAddRecipient}
            onRemoveMember={onRemoveRecipient}
            onChangeMember={onChangeRecipient}
          />
        </div>
      )}
    </div>
  );
};

import { MemberSelector } from "@/features/messages/components/MemberSelector";

interface Props {
  recipientMemberIds: number[];
  subjectMemberIds: number[];
  recipientsAreSubjects: boolean;
  onRecipientsAreSubjectsChange: (checked: boolean) => void;
  onAddRecipient: () => void;
  onRemoveRecipient: (index: number) => void;
  onChangeRecipient: (index: number, memberId: number | undefined) => void;
  onAddSubject: () => void;
  onRemoveSubject: (index: number) => void;
  onChangeSubject: (index: number, memberId: number | undefined) => void;
}

export const ContactMemberSelector = ({
  recipientMemberIds,
  subjectMemberIds,
  recipientsAreSubjects,
  onRecipientsAreSubjectsChange,
  onAddRecipient,
  onRemoveRecipient,
  onChangeRecipient,
  onAddSubject,
  onRemoveSubject,
  onChangeSubject,
}: Props) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="min-w-[120px]">
        <span className="text-xs text-gray-500 block mb-1 font-medium">
          Recipient:
        </span>
        <MemberSelector
          selectedMemberIds={recipientMemberIds}
          onAddMember={onAddRecipient}
          onRemoveMember={onRemoveRecipient}
          onChangeMember={onChangeRecipient}
          maxMembers={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={recipientsAreSubjects}
            onChange={(e) => onRecipientsAreSubjectsChange(e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />
          Recipients are subjects
        </label>
      </div>

      {!recipientsAreSubjects && (
        <div className="min-w-[120px]">
          <span className="text-xs text-gray-500 block mb-1 font-medium">
            Subject:
          </span>
          <MemberSelector
            selectedMemberIds={subjectMemberIds}
            onAddMember={onAddSubject}
            onRemoveMember={onRemoveSubject}
            onChangeMember={onChangeSubject}
            maxMembers={10}
          />
        </div>
      )}
    </div>
  );
};

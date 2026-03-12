import { MessagePreview } from "@/features/messages/components/MessagePreview";
import { MEMBER_SELECTION } from "@/constants";

interface Props {
  canShowPreview: boolean;
  canGenerate: boolean;
  templatePreview: string | null;
  isLoadingPreview: boolean;
  recipientPhoneNumbers: string[];
  selectedRecipientMemberIds: number[];
  subjects: { name: string }[];
  subjectTemplateMap: Record<string, string>;
  recipientsAreSubjects: boolean;
  onGeneratePreview: () => void;
}

export const GroupPreview = ({
  canShowPreview,
  canGenerate,
  templatePreview,
  isLoadingPreview,
  recipientPhoneNumbers,
  selectedRecipientMemberIds,
  subjects,
  subjectTemplateMap,
  recipientsAreSubjects,
  onGeneratePreview,
}: Props) => {
  if (!canShowPreview) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 text-sm">
        <p className="font-medium mb-2">
          Complete the steps above to see preview:
        </p>
        <ul className="list-disc list-inside space-y-1">
          {recipientsAreSubjects ? (
            subjects.length === 0 && <li>Select appointment subjects</li>
          ) : selectedRecipientMemberIds.filter(
              (id) => id !== MEMBER_SELECTION.INITIAL_MEMBER_ID,
            ).length === 0 ? (
            <li>Select message recipients</li>
          ) : null}
          {subjects.length === 0 && <li>Select appointment subjects</li>}
          {subjects.length > 0 &&
            Object.keys(subjectTemplateMap).length < subjects.length && (
              <li>Choose templates for all subjects</li>
            )}
        </ul>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Message Preview
      </h3>
      {canGenerate && !templatePreview && !isLoadingPreview && (
        <button
          onClick={onGeneratePreview}
          className="w-full mb-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Generate Message
        </button>
      )}
      <MessagePreview
        templatePreview={templatePreview || ""}
        phoneNumbers={recipientPhoneNumbers}
        isLoading={isLoadingPreview}
      />
    </div>
  );
};

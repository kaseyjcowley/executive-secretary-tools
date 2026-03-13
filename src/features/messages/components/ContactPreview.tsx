import { MessagePreview } from "@/features/messages/components/MessagePreview";

interface Props {
  canGenerate: boolean;
  templatePreview: string | null;
  isLoadingPreview: boolean;
  phoneNumbers: string[];
  validRecipientsCount: number;
  onGeneratePreview: () => void;
}

export const ContactPreview = ({
  canGenerate,
  templatePreview,
  isLoadingPreview,
  phoneNumbers,
  validRecipientsCount,
  onGeneratePreview,
}: Props) => {
  return (
    <div className="min-h-full mt-4 md:mt-0">
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
        phoneNumbers={phoneNumbers}
        isReady={validRecipientsCount > 0}
        isLoading={isLoadingPreview}
      />
    </div>
  );
};

import { IconMessage } from "@/components/ui/Icons";

interface MessagePreviewProps {
  templatePreview: string;
  phoneNumbers: string[];
  isReady?: boolean;
  isLoading?: boolean;
}

export function MessagePreview({
  templatePreview,
  phoneNumbers,
  isReady = true,
  isLoading = false,
}: MessagePreviewProps) {
  return (
    <div className="md:w-full md:min-w-[33%] md:h-full relative">
      {isLoading ? (
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 text-gray-500 text-sm text-center py-8">
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating message...
          </div>
        </div>
      ) : templatePreview ? (
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 text-gray-800 text-sm font-mono md:h-full overflow-visible relative">
          {phoneNumbers.length > 0 && (
            <a
              href={`sms:${phoneNumbers.join(",")}?body=${encodeURIComponent(templatePreview)}`}
              className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 md:hidden z-10"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconMessage className="w-6 h-6 rotate-45" />
            </a>
          )}
          <div className="text-gray-900 whitespace-pre-wrap break-words">
            {templatePreview.replace(/\\n/g, "\n")}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 italic text-sm text-center py-8">
          {isReady
            ? "Click Generate Message to preview"
            : "Fill in all required fields to preview the message"}
        </div>
      )}
    </div>
  );
}

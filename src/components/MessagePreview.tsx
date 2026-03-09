import { IconMessage } from "@/components/ui/Icons";

interface MessagePreviewProps {
  templatePreview: string;
  phoneNumbers: string[];
}

export function MessagePreview({
  templatePreview,
  phoneNumbers,
}: MessagePreviewProps) {
  return (
    <div className="md:w-full md:min-w-[33%] md:h-full relative">
      {templatePreview ? (
        <>
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
          <div
            className={`p-4 bg-gray-50 rounded-lg border-2 border-gray-200 text-gray-800 whitespace-pre-wrap text-sm font-mono md:h-full ${phoneNumbers.length > 0 ? "pt-6" : ""}`}
            dangerouslySetInnerHTML={{
              __html: templatePreview.replace(/\\n/g, "<br />"),
            }}
          />
        </>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 italic text-sm text-center py-8">
          Select a template to preview the message
        </div>
      )}
    </div>
  );
}

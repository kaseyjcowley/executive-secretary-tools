interface MessagePreviewProps {
  templatePreview: string;
  phoneNumbers: string[];
}

export function MessagePreview({
  templatePreview,
  phoneNumbers,
}: MessagePreviewProps) {
  return (
    <div className="w-full md:w-[30rem] md:flex-shrink-0 relative">
      {templatePreview ? (
        <>
          {phoneNumbers.length > 0 && (
            <a
              href={`sms:${phoneNumbers.join(",")}?body=${encodeURIComponent(templatePreview)}`}
              className="absolute top-1 right-2 text-sm text-blue-600 hover:text-blue-800 underline md:hidden"
              target="_blank"
              rel="noopener noreferrer"
            >
              Send message
            </a>
          )}
          <div
            className={`p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap text-sm ${phoneNumbers.length > 0 ? "pt-5" : ""}`}
            dangerouslySetInnerHTML={{
              __html: templatePreview.replace(/\\n/g, "<br />"),
            }}
          />
        </>
      ) : (
        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-500 italic text-sm">
          Select a template to preview the message
        </div>
      )}
    </div>
  );
}

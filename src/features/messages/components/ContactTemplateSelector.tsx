import { MessageType } from "@/types/messages";
import { TemplateSelector } from "@/features/messages/components/TemplateSelector";
import { TimeSelector } from "@/features/messages/components/TimeSelector";

interface Props {
  selectedTemplateId: string;
  selectedTime: string;
  categories: Record<string, MessageType[]>;
  onTemplateChange: (templateId: string) => void;
  onTimeChange: (time: string) => void;
}

export const ContactTemplateSelector = ({
  selectedTemplateId,
  selectedTime,
  categories,
  onTemplateChange,
  onTimeChange,
}: Props) => {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-[auto_auto] gap-2 md:gap-3 justify-start">
      <div className="min-w-[150px]">
        <TemplateSelector
          selectedTemplateId={selectedTemplateId}
          onChange={onTemplateChange}
          categories={categories}
        />
      </div>
      <div className="sm:mt-0">
        <TimeSelector selectedTime={selectedTime} onChange={onTimeChange} />
      </div>
    </div>
  );
};

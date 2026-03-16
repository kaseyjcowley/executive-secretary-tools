import { MessageType } from "@/types/messages";
import { Select } from "@/components/ui/Select";

interface TemplateSelectorProps {
  selectedTemplateId: string | undefined;
  onChange: (templateId: string) => void;
  categories: Record<string, MessageType[]>;
}

export function TemplateSelector({
  selectedTemplateId,
  onChange,
  categories,
}: TemplateSelectorProps) {
  return (
    <Select
      className="md:w-64"
      value={selectedTemplateId || ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select message type
      </option>

      {Object.entries(categories).map(([category, types]) => {
        if (types.length === 0) return null;
        return (
          <optgroup
            key={category}
            label={category.charAt(0).toUpperCase() + category.slice(1)}
          >
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </Select>
  );
}

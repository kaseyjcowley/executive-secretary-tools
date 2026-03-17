import { Contact } from "@/types/messages";
import { MessageType } from "@/types/messages";
import { TemplateSelector } from "@/features/messages/components/TemplateSelector";

interface Props {
  groupContacts: Contact[];
  subjects: Contact[];
  subjectTemplateMap: Record<string, string>;
  categories: Record<string, MessageType[]>;
  onToggleSubject: (contact: Contact) => void;
  onSetTemplateForSubject: (name: string, templateId: string) => void;
}

export const GroupSubjectStep = ({
  groupContacts,
  subjects,
  subjectTemplateMap,
  categories,
  onToggleSubject,
  onSetTemplateForSubject,
}: Props) => {
  return (
    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors duration-200">
      <label className="block text-sm font-semibold text-green-900 mb-2">
        Step 2: Configure Appointment Subjects
      </label>
      <p className="text-xs text-green-700 mb-3">
        Who are the appointments for? Select a template for each.
      </p>
      <div className="space-y-3">
        {groupContacts.map((contact) => (
          <div key={contact.name} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={subjects.some((s) => s.name === contact.name)}
              onChange={() => onToggleSubject(contact)}
              className="w-4 h-4 accent-green-600 rounded border-green-300"
            />
            <span className="flex-1 text-gray-700">{contact.name}</span>
            {subjects.some((s) => s.name === contact.name) && (
              <TemplateSelector
                selectedTemplateId={subjectTemplateMap[contact.name]}
                onChange={(id) => onSetTemplateForSubject(contact.name, id)}
                categories={categories}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

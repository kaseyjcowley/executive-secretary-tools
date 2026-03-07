import { useState, useMemo } from "react";
import { Contact } from "@/types/messages";

export function useGroupSubjects() {
  const [subjects, setSubjects] = useState<Contact[]>([]);
  const [subjectTemplateMap, setSubjectTemplateMap] = useState<
    Record<string, string>
  >({});

  const toggleSubject = (contact: Contact) => {
    const isSubject = subjects.some((s) => s.name === contact.name);
    if (isSubject) {
      setSubjects(subjects.filter((s) => s.name !== contact.name));
      const newMap = { ...subjectTemplateMap };
      delete newMap[contact.name];
      setSubjectTemplateMap(newMap);
    } else {
      setSubjects([...subjects, contact]);
    }
  };

  const setTemplateForSubject = (contactName: string, templateId: string) => {
    setSubjectTemplateMap({
      ...subjectTemplateMap,
      [contactName]: templateId,
    });
  };

  const canShowPreview = useMemo(() => {
    const hasSubjects = subjects.length > 0;
    const allTemplatesSelected =
      Object.keys(subjectTemplateMap).length === subjects.length;
    return hasSubjects && allTemplatesSelected;
  }, [subjects, subjectTemplateMap]);

  return {
    subjects,
    subjectTemplateMap,
    toggleSubject,
    setTemplateForSubject,
    canShowPreview,
  };
}

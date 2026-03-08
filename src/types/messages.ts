import { InterviewTrelloCard, CallingTrelloCard } from "@/requests/cards/types";

export enum Category {
  calling = "calling",
  interview = "interview",
}

export type Contact = InterviewTrelloCard | CallingTrelloCard;

export interface ContactState {
  contact: Contact;
  selectedTemplate?: string;
  messagePreview?: string;
}

export interface TemplateVariables {
  /** @deprecated Use `recipients` instead */
  name: string;
  /** @deprecated Will be removed */
  phone?: string;
  /** @deprecated Use `appointmentSummary` instead */
  appointmentType?: string;
  /** @deprecated Will be removed */
  date?: string;
  time?: string;
  /** @deprecated Will be removed */
  location?: string;

  // New standardized variables
  /** Formatted list of message recipients (e.g., "John" or "John and Jane") */
  recipients?: string;
  /** Formatted list of subject first names (e.g., "Tom" or "Tom and Sally") */
  subjects?: string;
  /** Verb conjugation helper: "is" for singular, "are" for plural */
  verb?: string;

  [key: string]: unknown; // Index signature to allow any string key
}

export interface MessageType {
  id: string;
  name: string;
  category: Category;
  templatePath: string;
  content: string;
}

export interface ContactGroup {
  id: string;
  memberIds: string[];
  createdAt: Date;
}

export type ContactListItem = Contact | ContactGroup;

export function isContactGroup(item: ContactListItem): item is ContactGroup {
  return "memberIds" in item && !("kind" in item);
}

export type ScenarioType =
  | "single"
  | "pair-recipients"
  | "pair-subjects"
  | "multiple-types";

export interface SubjectItem {
  name: string;
  appointmentType: string;
  summary: string;
}

export interface GroupTemplateVariables {
  /** @deprecated Use `recipients` instead */
  greeting: string;
  /** @deprecated Will be removed */
  pronoun: string;
  /** Verb conjugation helper: "is" for singular, "are" for plural */
  verb: string;
  /** @deprecated Will be removed */
  possessive: string;
  /** @deprecated Use `subjects` instead */
  subjectNames?: string;
  /** @deprecated Will be removed */
  subjectList?: SubjectItem[];
  appointmentSummary: string;
  /** @deprecated Will be removed */
  schedulingPhrase: string;
  time?: string;
  /** @deprecated Will be removed */
  bulletList?: string;

  // New standardized variables
  /** Formatted list of message recipients (e.g., "John" or "John and Jane") */
  recipients?: string;
  /** Formatted list of subject first names (e.g., "Tom" or "Tom and Sally") */
  subjects?: string;

  [key: string]: unknown;
}

export interface MessageScenario {
  type: ScenarioType;
  recipients: Contact[];
  subjects: Contact[];
  appointmentTypes: Map<string, Contact[]>;
  recipientNames?: string[];
}

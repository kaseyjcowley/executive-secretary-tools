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
  name: string;
  phone?: string;
  appointmentType?: string;
  date?: string;
  time?: string;
  location?: string;
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
  greeting: string;
  pronoun: string;
  verb: string;
  possessive: string;
  subjectNames?: string;
  subjectList?: SubjectItem[];
  appointmentSummary: string;
  time?: string;
  bulletList?: string;
  [key: string]: unknown;
}

export interface MessageScenario {
  type: ScenarioType;
  recipients: Contact[];
  subjects: Contact[];
  appointmentTypes: Map<string, Contact[]>;
}

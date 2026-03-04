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

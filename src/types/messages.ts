import { InterviewTrelloCard, CallingTrelloCard } from "@/requests/cards/types";

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

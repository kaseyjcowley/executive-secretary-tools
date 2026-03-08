import { Contact, ContactGroup } from "@/types/messages";
import { CallingStage } from "@/constants";

export const createInterviewContact = (
  name: string,
  labels?: { id: string; name: string },
  options?: {
    phone?: string;
    due?: string;
    idMembers?: string;
  },
): Contact => ({
  name,
  due: options?.due ?? "2024-01-15T14:00:00.000Z",
  idMembers: options?.idMembers ?? "member-1",
  assigned: undefined,
  kind: "interview",
  labels,
  phone: options?.phone,
});

export const createCallingContact = (
  name: string,
  calling: string,
  stage: CallingStage,
  options?: {
    phone?: string;
    due?: string;
    idMembers?: string;
  },
): Contact => ({
  name,
  due: options?.due ?? "2024-01-15T14:00:00.000Z",
  idMembers: options?.idMembers ?? "member-1",
  assigned: undefined,
  kind: "calling",
  calling,
  stage,
  phone: options?.phone,
});

export const createContactGroup = (memberIds: string[]): ContactGroup => ({
  id: `group-${Math.random().toString(36).substring(7)}`,
  memberIds,
  createdAt: new Date(),
});

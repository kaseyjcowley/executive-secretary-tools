import { Contact, MessageType } from "@/types/messages";
import { CallingStage } from "@/constants";

const TEMPLATE_MATCHERS: Array<{
  matcher: (labelName: string) => boolean;
  templateId: string;
}> = [
  { matcher: (label) => label.includes("temple"), templateId: "temple-visit" },
  {
    matcher: (label) => label.includes("welfare"),
    templateId: "welfare-meeting",
  },
  {
    matcher: (label) => label.includes("family"),
    templateId: "family-council",
  },
  {
    matcher: (label) => label.includes("bishop"),
    templateId: "bishop-interview",
  },
  {
    matcher: (label) => label.includes("first counselor"),
    templateId: "first-counselor-interview",
  },
  {
    matcher: (label) => label.includes("second counselor"),
    templateId: "second-counselor-interview",
  },
  {
    matcher: (label) => label.includes("setting apart"),
    templateId: "setting-apart",
  },
  { matcher: (label) => label.includes("follow"), templateId: "follow-up" },
];

export function autoSelectTemplate(
  contact: Contact,
  messageTypes: MessageType[],
): string | undefined {
  if (contact.kind === "calling") {
    return contact.stage === CallingStage.needsCallingExtended
      ? "extend-calling"
      : "setting-apart";
  }

  if (contact.kind === "interview" && contact.labels?.name) {
    const labelName = contact.labels.name.toLowerCase();

    const exactMatch = messageTypes.find(
      (mt) => mt.id === labelName.replace(/\s+/g, "-"),
    );
    if (exactMatch) return exactMatch.id;

    for (const { matcher, templateId } of TEMPLATE_MATCHERS) {
      const template = messageTypes.find((mt) => mt.id === templateId);
      if (template && matcher(labelName)) {
        return templateId;
      }
    }

    const defaultTemplate = messageTypes.find(
      (mt) => mt.id === "interview-reminder",
    );
    return defaultTemplate?.id;
  }

  return undefined;
}

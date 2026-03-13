import { Contact } from "@/types/messages";
import {
  appointmentSummaries,
  AppointmentSummary,
} from "@/constants/appointment-summaries";
import { getBeforeOrAfterChurch } from "@/utils/time-utils";
import { format, isSunday, parse, startOfTomorrow } from "date-fns";

interface GroupMember {
  name: string;
  templateId: string;
}

interface GroupMessageContext {
  recipientNames: string;
  time: string;
  templateIds: Record<string, string>;
  members: Contact[];
}

function getBeforeOrAfter(time: string): string {
  return getBeforeOrAfterChurch(time);
}

function formatTime(time: string): string {
  return format(parse(time, "HH:mm", new Date()), "h:mm a");
}

function getDateString(): string {
  return isSunday(startOfTomorrow()) ? "tomorrow" : "Sunday";
}

function formatMemberNames(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  const allButLast = names.slice(0, -1).join(", ");
  return `${allButLast}, and ${names[names.length - 1]}`;
}

function getSummary(
  templateId: string,
  memberCount: number,
  recipientsAreSubjects: boolean,
): string {
  const summary = appointmentSummaries[templateId];
  if (!summary) {
    return "we need to connect with you";
  }

  if (memberCount === 1) {
    return summary.singular;
  }

  if (recipientsAreSubjects) {
    return summary.pluralRecipients;
  }

  return summary.pluralSubjects;
}

export function generateGroupMessage(context: GroupMessageContext): string {
  const { recipientNames, time, templateIds, members } = context;

  const dateString = getDateString();
  const timeFormatted = formatTime(time);
  const beforeOrAfter = getBeforeOrAfter(time);

  const memberList: GroupMember[] = members
    .map((m) => ({
      name: m.name,
      templateId: templateIds[m.name] || "",
    }))
    .filter((m) => m.templateId);

  if (memberList.length === 0) {
    return `Hey ${recipientNames || "there"}! Are you available ${dateString} ${beforeOrAfter} at ${timeFormatted}?`;
  }

  const templateIdsList = memberList.map((m) => m.templateId);
  const allSameTemplate = templateIdsList.every(
    (id) => id === templateIdsList[0],
  );

  const memberNames = memberList.map((m) => m.name);
  const formattedNames = formatMemberNames(memberNames);
  const recipientsAreSubjects = memberNames.length > 0;

  if (allSameTemplate && memberList.length > 1) {
    const summary = getSummary(
      templateIdsList[0],
      memberList.length,
      recipientsAreSubjects,
    );

    return `Hey ${recipientNames || "there"}! Our records indicate that ${formattedNames} ${summary}. The Bishopric has times this Sunday for recommend renewals. If you would like to get on our schedule, please let me know!`;
  }

  if (allSameTemplate && memberList.length === 1) {
    const summary = getSummary(templateIdsList[0], 1, true);
    return `Hey ${recipientNames || "there"}! Our records indicate that ${summary}. The Bishopric has times this Sunday for recommend renewals. If you would like to get on our schedule, please let me know!`;
  }

  const lines = memberList.map((m) => {
    const summary = getSummary(m.templateId, 1, false);
    return `• ${m.name} - ${summary}`;
  });

  return `Hey ${recipientNames || "there"}! Our records indicate:\n\n${lines.join("\n")}\n\nThe Bishopric has times this Sunday. If you would like to get on our schedule, please let me know!`;
}

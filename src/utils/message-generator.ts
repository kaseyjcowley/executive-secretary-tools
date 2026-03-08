import {
  MessageScenario,
  GroupTemplateVariables,
  SubjectItem,
  Contact,
  ScenarioType,
} from "@/types/messages";
import { loadTemplateContent } from "./template-loader";
import { substituteTemplate } from "./template-substitution";
import { formatNameList, getPossessive, getPronoun } from "./grammar";
import {
  appointmentSummaries,
  AppointmentSummary,
} from "@/constants/appointment-summaries";
import { CallingStage } from "@/constants";

export function generateMessage(scenario: MessageScenario): string {
  try {
    if (scenario.type === "multiple-types") {
      const variables = buildTemplateVariables(scenario);
      return generateListMessage(scenario, variables);
    }

    const templateId = Array.from(scenario.appointmentTypes.keys())[0];

    if (!templateId) {
      return "Error: No appointment type selected";
    }

    const template = loadTemplateContent(templateId);

    if (!template) {
      return `Error: Template "${templateId}" not found`;
    }

    const variables = buildTemplateVariables(scenario, templateId);

    return substituteTemplate(template, variables);
  } catch (error) {
    return `Error generating message: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
}

export function classifyScenario(
  recipients: Contact[],
  subjects: Contact[],
): ScenarioType {
  const recipientCount = recipients.length;
  const subjectCount = subjects.length;

  if (recipientCount === 0 || subjectCount === 0) {
    return "single";
  }

  const appointmentTypes = new Set(
    subjects.map((s) => getTemplateIdForContact(s)),
  );

  if (recipientCount === 1 && subjectCount === 1) {
    if (recipients[0].name === subjects[0].name) {
      return "single";
    }
    return "pair-subjects";
  }

  if (
    recipientCount === 2 &&
    subjectCount === 2 &&
    appointmentTypes.size === 1
  ) {
    const recipientsMatchSubjects = recipients.every((r) =>
      subjects.some((s) => s.name === r.name),
    );
    if (recipientsMatchSubjects) {
      return "pair-recipients";
    }
    return "pair-subjects";
  }

  if (recipientCount <= 2 && appointmentTypes.size === 1) {
    const recipientsMatchSubjects = recipients.every((r) =>
      subjects.some((s) => s.name === r.name),
    );
    if (recipientsMatchSubjects) {
      return "pair-recipients";
    }
    return "pair-subjects";
  }

  if (appointmentTypes.size > 1) {
    return "multiple-types";
  }

  return "single";
}

function buildTemplateVariables(
  scenario: MessageScenario,
  templateIdFromMap?: string,
): GroupTemplateVariables {
  const { recipients, subjects, type, recipientNames } = scenario;

  const formattedNames =
    recipientNames && recipientNames.length > 0
      ? recipientNames
      : recipients.map((r) => r.name);

  const greeting =
    formattedNames.length === 1
      ? formattedNames[0]
      : formatNameList(formattedNames);

  const recipientsAreSubjects = recipients.every((r) =>
    subjects.some((s) => s.name === r.name),
  );

  const pronoun = getPronoun(recipientsAreSubjects, subjects.length);

  const subjectFirstNames = subjects.map((s) => {
    const parts = s.name.split(",");
    let firstName: string;
    if (parts.length > 1) {
      firstName = parts[1].trim();
    } else {
      const nameParts = s.name.split(" ");
      firstName = nameParts[0];
    }
    return firstName;
  });

  const formattedSubjectFirstNames = formatNameList(subjectFirstNames);

  let possessive: string;
  if (recipientsAreSubjects) {
    possessive = "your";
  } else {
    possessive = getPossessive(formattedSubjectFirstNames);
  }

  const appointmentSummary = getAppointmentSummary(scenario, templateIdFromMap);

  const subjectNames =
    !recipientsAreSubjects && subjects.length > 0
      ? formatNameList(subjects.map((s) => s.name))
      : undefined;

  const subjectList =
    type === "multiple-types"
      ? buildSubjectList(subjects, scenario.appointmentTypes)
      : undefined;

  const schedulingPhrase = recipientsAreSubjects
    ? "If you would like to get on our schedule to renew"
    : "If you would like to get them on our schedule to renew";

  const verb = subjects.length === 1 ? "is" : "are";

  return {
    greeting,
    pronoun,
    possessive,
    verb,
    subjectNames,
    subjectList,
    appointmentSummary,
    schedulingPhrase,
    recipients: greeting,
    subjects: formattedSubjectFirstNames,
  };
}

function generateListMessage(
  scenario: MessageScenario,
  variables: GroupTemplateVariables,
): string {
  const { subjectList } = variables;

  if (!subjectList || subjectList.length === 0) {
    return `Hello ${variables.greeting}! No appointments to schedule.`;
  }

  const bulletList = subjectList
    .map((item) => `• ${item.name} - ${item.summary}`)
    .join("\n");

  const template = loadTemplateContent("multiple-appointments");

  if (!template) {
    return `Error: Template "multiple-appointments" not found`;
  }

  return substituteTemplate(template, {
    greeting: variables.greeting,
    pronoun: variables.pronoun,
    possessive: variables.possessive,
    verb: variables.verb,
    subjectNames: variables.subjectNames,
    subjectList: variables.subjectList,
    appointmentSummary: variables.appointmentSummary,
    bulletList,
  });
}

function getTemplateIdForContact(contact: Contact): string {
  if (contact.kind === "calling") {
    return contact.stage === CallingStage.needsCallingExtended
      ? "extend-calling"
      : "setting-apart";
  }

  if (contact.labels?.name) {
    const labelName = contact.labels.name.toLowerCase();

    if (labelName.includes("temple")) {
      return "temple-recommend-renewal";
    }

    if (labelName.includes("welfare")) {
      return "welfare-meeting";
    }

    if (labelName.includes("family")) {
      return "family-council";
    }

    if (labelName.includes("bishop")) {
      return "bishop-interview";
    }

    if (labelName.includes("first counselor")) {
      return "first-counselor-interview";
    }

    if (labelName.includes("second counselor")) {
      return "second-counselor-interview";
    }

    if (labelName.includes("setting apart")) {
      return "setting-apart";
    }

    if (labelName.includes("follow")) {
      return "follow-up";
    }

    const exactMatch = labelName.replace(/\s+/g, "-");
    if (appointmentSummaries[exactMatch]) {
      return exactMatch;
    }
  }

  return "interview-reminder";
}

function getAppointmentSummary(
  scenario: MessageScenario,
  templateIdFromMap?: string,
): string {
  const { subjects, type } = scenario;

  if (type === "multiple-types") {
    return "";
  }

  const templateId = templateIdFromMap || getTemplateIdForContact(subjects[0]);
  const summary: AppointmentSummary | undefined =
    appointmentSummaries[templateId];

  if (!summary) {
    return "we need to connect with you";
  }

  const recipientsAreSubjects = scenario.recipients.every((r) =>
    scenario.subjects.some((s) => s.name === r.name),
  );

  let summaryText: string;
  if (recipientsAreSubjects) {
    summaryText =
      subjects.length === 1 ? summary.singular : summary.pluralRecipients;
  } else {
    summaryText =
      subjects.length === 1 ? summary.singular : summary.pluralSubjects;

    const subjectNames = subjects.map((s) => {
      const parts = s.name.split(",");
      let firstName: string;
      if (parts.length > 1) {
        firstName = parts[1].trim();
      } else {
        const nameParts = s.name.split(" ");
        firstName = nameParts[0];
      }
      return firstName;
    });

    const formattedNames = formatNameList(subjectNames);
    const possessive = getPossessive(formattedNames);
    summaryText = summaryText.replace(/\b(your|their)\b/gi, possessive);
  }

  return summaryText;
}

function buildSubjectList(
  subjects: Contact[],
  appointmentTypes: Map<string, Contact[]>,
): SubjectItem[] {
  return subjects.map((subject) => {
    const templateId = Array.from(appointmentTypes.entries()).find(
      ([, contacts]) => contacts.some((c) => c.name === subject.name),
    )?.[0];

    const resolvedTemplateId = templateId || getTemplateIdForContact(subject);
    const summary = appointmentSummaries[resolvedTemplateId];

    const parts = subject.name.split(",");
    let firstName: string;
    if (parts.length > 1) {
      firstName = parts[1].trim();
    } else {
      const nameParts = subject.name.split(" ");
      firstName = nameParts[0];
    }

    return {
      name: firstName,
      appointmentType: resolvedTemplateId,
      summary: summary?.listFormat || "appointment needed",
    };
  });
}

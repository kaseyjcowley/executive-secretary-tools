import { generateText } from "ai";
import { MODELS } from "../client";
import { PROMPTS } from "../prompts";
import type { LlmJob } from "../types";

export interface FormatSmsInput {
  templateName: string;
  data: {
    template: string;
    recipients: string[];
    subjects?: string[];
    meetingTime?: string;
    churchEndTime?: string;
    date?: string;
    time?: string;
    withWhom?: string;
  };
}

export interface FormatSmsOutput {
  message: string;
}

export const formatSmsJob: LlmJob<FormatSmsInput, FormatSmsOutput> = {
  name: "format-sms",

  async run(input) {
    const {
      template,
      recipients,
      subjects,
      meetingTime,
      churchEndTime,
      date,
      time,
      withWhom,
    } = input.data;

    const { text } = await generateText({
      model: MODELS.fast,
      maxOutputTokens: 200,
      temperature: 0,
      topP: 1,
      system: PROMPTS.formatSms,
      prompt: [
        `TEMPLATE: ${template}`,
        ``,
        `RECIPIENTS: ${JSON.stringify(recipients)}`,
        subjects && `SUBJECTS: ${JSON.stringify(subjects)}`,
        meetingTime && `MEETING TIME: ${meetingTime}`,
        churchEndTime && `CHURCH END TIME: ${churchEndTime}`,
        date && `DATE: ${date}`,
        time && `TIME: ${time}`,
        withWhom && `WITH WHOM: ${withWhom}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return { message: text.trim() };
  },
};

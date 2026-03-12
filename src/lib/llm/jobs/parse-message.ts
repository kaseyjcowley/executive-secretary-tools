import { generateObject } from "ai";
import { z } from "zod";
import { MODELS } from "../client";
import { PROMPTS } from "../prompts";
import type { LlmJob } from "../types";

export interface ParseMessageInput {
  message: string;
  expectedFields: string[];
}

export const parseMessageJob: LlmJob<
  ParseMessageInput,
  Record<string, unknown>
> = {
  name: "parse-message",

  async run(input) {
    const schemaShape = Object.fromEntries(
      input.expectedFields.map((field) => [field, z.string().nullable()]),
    );

    const { object } = await generateObject({
      model: MODELS.fast,
      maxOutputTokens: 300,
      temperature: 0,
      system: PROMPTS.parseInboundMessage,
      prompt: [
        `Message: "${input.message}"`,
        `Extract these fields if present: ${input.expectedFields.join(", ")}`,
        `Use null for any fields not found in the message.`,
      ].join("\n"),
      schema: z.object(schemaShape),
    });

    return object;
  },
};

import { createGroq } from "@ai-sdk/groq";

export const groq = createGroq();

export const MODELS = {
  fast: groq("llama-3.1-8b-instant"),
  balanced: groq("llama-3.3-70b-versatile"),
} as const;

import { formatSmsJob } from "./format-sms";
import { parseMessageJob } from "./parse-message";
import type { LlmJob } from "../types";

const registry: Record<string, LlmJob<unknown, unknown>> = {
  [formatSmsJob.name]: formatSmsJob,
  [parseMessageJob.name]: parseMessageJob,
};

export function getJob(name: string) {
  return registry[name] ?? null;
}

export { formatSmsJob, parseMessageJob };

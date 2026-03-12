# LLM Integration Plan - Groq Inference Architecture

**Branch**: `experiment/llm-integration`  
**Date**: March 10, 2026  
**Status**: Planning Complete

---

## Overview

Replace existing template substitution system with Groq-powered LLM inference for SMS message generation. The LLM will handle grammar, pronouns, and verb conjugation automatically, eliminating the need for complex placeholder logic.

### Key Design Decisions

- **Full replacement** of template substitution (no fallback)
- **Temperature: 0** for deterministic, predictable output
- **Natural example templates** instead of placeholder syntax
- **Grammar permutation examples** in templates (recipient=subject, recipient≠subject, multiple recipients=subjects, multiple recipients≠subjects)
- **NextAuth required** for API endpoint
- **`multiple-appointments` template** kept as special case (existing logic)

---

## Dependencies

```bash
pnpm add ai @ai-sdk/groq zod
```

| Package        | Purpose                                               |
| -------------- | ----------------------------------------------------- |
| `ai`           | Vercel AI SDK core (`generateText`, `generateObject`) |
| `@ai-sdk/groq` | Groq provider adapter                                 |
| `zod`          | Schema validation for structured output               |

---

## File Structure

```
src/
├── lib/
│   └── llm/
│       ├── client.ts           # Groq provider + MODELS constant
│       ├── types.ts            # LlmJob interface + API types
│       ├── prompts.ts          # System prompts
│       └── jobs/
│           ├── format-sms.ts   # SMS formatter (temperature: 0)
│           ├── parse-message.ts # Message parser with Zod schema
│           └── index.ts        # Job registry + dispatcher
├── app/
│   └── api/
│       └── llm/
│           └── route.ts        # POST endpoint with NextAuth
├── templates/
│   └── messages/               # Updated to natural examples
│       ├── interview-reminder.txt
│       ├── baptismal-interview.txt
│       ├── bishop-youth-interview.txt
│       ├── counselor-youth-interview.txt
│       ├── extend-calling.txt
│       ├── setting-apart.txt
│       ├── temple-recommend-renewal.txt
│       ├── tithing-declaration.txt
│       └── multiple-appointments.txt  # Keep as-is (special case)
```

---

## Implementation Files

### 1. `src/lib/llm/client.ts`

Groq provider singleton with model options.

```typescript
import { createGroq } from "@ai-sdk/groq";

export const groq = createGroq();

export const MODELS = {
  fast: groq("llama-3.1-8b-instant"), // Default - fastest, cheapest
  balanced: groq("llama-3.3-70b-versatile"), // Step up if 8B isn't enough
} as const;
```

**Environment**: Reads `GROQ_API_KEY` automatically from env.

---

### 2. `src/lib/llm/types.ts`

Shared contracts for all LLM jobs.

```typescript
export interface LlmJob<TInput, TOutput> {
  name: string;
  run(input: TInput): Promise<TOutput>;
}

export interface LlmJobRequest {
  job: string;
  payload: unknown;
}

export interface LlmJobResponse {
  result: unknown;
  error?: string;
}
```

---

### 3. `src/lib/llm/prompts.ts`

Centralized system prompts for all jobs.

```typescript
export const PROMPTS = {
  formatSms: `
You are a precise SMS message formatter.
Given a list of example messages showing different grammar permutations and new data, select the appropriate example and adapt it for the new data.

GRAMMAR PERMUTATIONS:
1. Single recipient who IS the subject (e.g., "Are you available...")
2. Single recipient who is NOT the subject (e.g., "Are you available for John...")
3. Multiple recipients who ARE the subjects (e.g., "Are you both available..." or "Are you all available...")
4. Multiple recipients who are NOT the subjects (e.g., "Are you both available for John and Jane...")

Select the example that matches the data provided and adapt it accordingly.

RULES:
- Follow the selected example's structure, tone, and formality exactly
- Substitute the new data naturally
- Handle all grammar automatically (verb conjugation, pronouns, possessives, pluralization)
- Do NOT invent new formats or add information
- Output ONLY the final message — no quotes, no explanation
  `.trim(),

  parseInboundMessage: `
You are a data extraction assistant.
Extract structured information from the message and return valid JSON only.
Do not include explanation or markdown — output raw JSON only.
  `.trim(),
} as const;
```

---

### 4. `src/lib/llm/jobs/format-sms.ts`

SMS message formatter using `generateText`.

```typescript
import { generateText } from "ai";
import { MODELS } from "../client";
import { PROMPTS } from "../prompts";
import type { LlmJob } from "../types";
import { loadTemplate } from "@/utils/templates";

export interface FormatSmsInput {
  templateName: string;
  data: {
    recipients: string | string[]; // Person(s) receiving the message
    subjects?: string | string[]; // Person(s) who is/are the subject of the appointment (optional - defaults to recipients)
    date?: string;
    time?: string;
    location?: string;
    appointmentType?: string;
    withWhom?: string;
    [key: string]: string | string[] | undefined;
  };
  maxLength?: number;
}

export interface FormatSmsOutput {
  message: string;
}

export const formatSmsJob: LlmJob<FormatSmsInput, FormatSmsOutput> = {
  name: "format-sms",

  async run(input) {
    const examples = loadTemplate(input.templateName);

    const { text } = await generateText({
      model: MODELS.fast,
      maxTokens: 200,
      temperature: 0,
      system: PROMPTS.formatSms,
      prompt: [
        `Examples (select the appropriate one based on the data):`,
        examples,
        ``,
        `New data:`,
        JSON.stringify(input.data, null, 2),
        ``,
        `Generate a message following the appropriate example pattern with the new data.`,
        input.maxLength ? `Max characters: ${input.maxLength}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return { message: text.trim() };
  },
};
```

**Key Features**:

- `temperature: 0` for deterministic output
- Loads all template examples (grammar permutations) at once
- Supports `recipients` (who receives the message) and `subjects` (who the appointment is about) as separate fields
- LLM selects appropriate grammar example based on data provided
- Flexible data input (just the facts, LLM handles grammar)

---

### 5. `src/lib/llm/jobs/parse-message.ts`

Message parser using `generateObject` with Zod schema.

```typescript
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
      maxTokens: 300,
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
```

**Key Features**:

- `generateObject` guarantees schema-compliant output
- Automatic retries on malformed JSON
- Dynamic schema from `expectedFields`

---

### 6. `src/lib/llm/jobs/index.ts`

Job registry and dispatcher.

```typescript
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
```

**Adding a new job**: One line in registry.

---

### 7. `src/app/api/llm/route.ts`

API endpoint with NextAuth protection.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getJob } from "@/lib/llm/jobs";
import { authOptions } from "@/utils/auth-options";
import type { LlmJobRequest, LlmJobResponse } from "@/lib/llm/types";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json<LlmJobResponse>(
      { result: null, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as LlmJobRequest;
  const { job: jobName, payload } = body;

  const job = getJob(jobName);

  if (!job) {
    return NextResponse.json<LlmJobResponse>(
      { result: null, error: `Unknown job: ${jobName}` },
      { status: 400 },
    );
  }

  try {
    const result = await job.run(payload);
    return NextResponse.json<LlmJobResponse>({ result });
  } catch (err) {
    console.error(`[llm] Job "${jobName}" failed:`, err);
    return NextResponse.json<LlmJobResponse>(
      { result: null, error: "Job execution failed" },
      { status: 500 },
    );
  }
}
```

---

## Template Updates

Convert all templates from placeholder syntax to natural examples with grammar permutations.

### Template Format

Each template file contains 4 examples (one for each grammar permutation):

```
# Single recipient who IS the subject
SINGLE_SUBJECT: "Hello John, this is a reminder about your appointment with Bishop Preece on Tuesday at 3pm."

# Single recipient who is NOT the subject
SINGLE_NON_SUBJECT: "Hello Parents, this is a reminder about your child's appointment with Bishop Preece on Tuesday at 3pm."

# Multiple recipients who ARE the subjects
MULTIPLE_SUBJECTS: "Hello John and Jane, this is a reminder about your appointments with Bishop Preece on Tuesday at 3pm."

# Multiple recipients who are NOT the subjects
MULTIPLE_NON_SUBJECT: "Hello Parents, this is a reminder about your children's appointments with Bishop Preece on Tuesday at 3pm."
```

### `src/templates/messages/interview-reminder.txt`

```
# Single recipient who IS the subject
SINGLE_SUBJECT: "Hello John, this is a reminder about your appointment with Bishop Preece on Tuesday at 3pm."

# Single recipient who is NOT the subject
SINGLE_NON_SUBJECT: "Hello Mr. Smith, this is a reminder about your son John's appointment with Bishop Preece on Tuesday at 3pm."

# Multiple recipients who ARE the subjects
MULTIPLE_SUBJECTS: "Hello John and Jane, this is a reminder about your appointments with Bishop Preece on Tuesday at 3pm."

# Multiple recipients who are NOT the subjects
MULTIPLE_NON_SUBJECT: "Hello Mr. and Mrs. Smith, this is a reminder about your children John and Jane's appointments with Bishop Preece on Tuesday at 3pm."
```

**Usage**:

```typescript
{
  templateName: "interview-reminder",
  data: {
    recipients: "Jane",
    date: "Sunday",
    time: "11am",
    withWhom: "Bishop Smith"
  }
}
// LLM picks SINGLE_SUBJECT since recipients = subject

{
  templateName: "interview-reminder",
  data: {
    recipients: "Parents",
    subjects: "John",
    date: "Sunday",
    time: "11am",
    withWhom: "Bishop Smith"
  }
}
// LLM picks SINGLE_NON_SUBJECT since recipients ≠ subject
```

---

### `src/templates/messages/baptismal-interview.txt`

```
# Single recipient who IS the subject
SINGLE_SUBJECT: "Hello Jane, are you available Sunday after church at 2pm for your baptismal interview with Bishop Preece?"

# Single recipient who is NOT the subject
SINGLE_NON_SUBJECT: "Hello Mr. and Mrs. Doe, are you available Sunday after church at 2pm for your daughter's baptismal interview with Bishop Preece?"

# Multiple recipients who ARE the subjects
MULTIPLE_SUBJECTS: "Hello Jane and Sam, are you both available Sunday after church at 2pm for your baptismal interviews with Bishop Preece?"

# Multiple recipients who are NOT the subjects
MULTIPLE_NON_SUBJECT: "Hello Mr. and Mrs. Doe, are you both available Sunday after church at 2pm for your children Jane and Sam's baptismal interviews with Bishop Preece?"
```

---

### `src/templates/messages/bishop-youth-interview.txt`

```
# Single recipient who IS the subject
SINGLE_SUBJECT: "Hey Sam! Are you available Sunday after church to meet with Bishop Preece for your annual interview?"

# Single recipient who is NOT the subject
SINGLE_NON_SUBJECT: "Hello Mr. Smith, are you available Sunday after church to meet with Bishop Preece regarding your son Sam's annual interview?"

# Multiple recipients who ARE the subjects
MULTIPLE_SUBJECTS: "Hey Sam and Alex! Are you both available Sunday after church to meet with Bishop Preece for your annual interviews?"

# Multiple recipients who are NOT the subjects
MULTIPLE_NON_SUBJECT: "Hello Mr. and Mrs. Smith, are you both available Sunday after church to meet with Bishop Preece regarding your sons Sam and Alex's annual interviews?"
```

---

### `src/templates/messages/counselor-youth-interview.txt`

```
# Single recipient who IS the subject
SINGLE_SUBJECT: "Hello Alex, are you available Sunday after church at 2pm to meet with a member of the Bishopric for a check-in?"

# Single recipient who is NOT the subject
SINGLE_NON_SUBJECT: "Hello Mr. Jones, are you available Sunday after child at 2pm to attend your son Alex's check-in with a member of the Bishopric?"

# Multiple recipients who ARE the subjects
MULTIPLE_SUBJECTS: "Hello Alex and Taylor, are you both available Sunday after church at 2pm to meet with a member of the Bishopric for check-ins?"

# Multiple recipients who are NOT the subjects
MULTIPLE_NON_SUBJECT: "Hello Mr. and Mrs. Jones, are you both available Sunday after church at 2pm to attend your children Alex and Taylor's check-ins with a member of the Bishopric?"
```

---

### `src/templates/messages/extend-calling.txt`

```
# Single recipient who IS the subject
SINGLE_SUBJECT: "Hey Taylor! Are you available Sunday after church at 2pm to meet with a member of the Bishopric about extending a calling?"

# Single recipient who is NOT the subject
SINGLE_NON_SUBJECT: "Hello Mr. Wilson, are you available Sunday after church at 2pm to meet with a member of the Bishopric regarding extending a calling to your spouse?"

# Multiple recipients who ARE the subjects
MULTIPLE_SUBJECTS: "Hey Taylor and Jordan! Are you both available Sunday after church at 2pm to meet with a member of the Bishopric about extending callings?"

# Multiple recipients who are NOT the subjects
MULTIPLE_NON_SUBJECT: "Hello Mr. and Mrs. Wilson, are you both available Sunday after church at 2pm to meet with a member of the Bishopric regarding extending callings to your spouse and children?"
```

---

### `src/templates/messages/setting-apart.txt`

```
# Single recipient who IS the subject
SINGLE_SUBJECT: "Hey Jordan, are you available Sunday after church to be set apart as the new Sunday School teacher?"

# Single recipient who is NOT the subject
SINGLE_NON_SUBJECT: "Hello Mr. Brown, are you available Sunday after church to set apart your son Jordan as the new Sunday School teacher?"

# Multiple recipients who ARE the subjects
MULTIPLE_SUBJECTS: "Hey Jordan and Casey, are you both available Sunday after church to be set apart as the new Sunday School teachers?"

# Multiple recipients who are NOT the subjects
MULTIPLE_NON_SUBJECT: "Hello Mr. and Mrs. Brown, are you both available Sunday after church to set apart your sons Jordan and Casey as the new Sunday School teachers?"
```

---

### `src/templates/messages/temple-recommend-renewal.txt`

```
# Single recipient who IS the subject
SINGLE_SUBJECT: "Hello Casey! Our records indicate that your temple recommend expires at the end of this month. The Bishopric has times this Sunday for recommend renewals. If you'd like to get on the schedule, please let me know!"

# Single recipient who is NOT the subject
SINGLE_NON_SUBJECT: "Hello Mr. Miller, our records indicate that your wife's temple recommend expires at the end of this month. The Bishopric has times this Sunday for recommend renewals. If you'd like to get her on the schedule, please let me know!"

# Multiple recipients who ARE the subjects
MULTIPLE_SUBJECTS: "Hello Casey and Morgan! Our records indicate that your temple recommends expire at the end of this month. The Bishopric has times this Sunday for recommend renewals. If you'd like to get on the schedule, please let me know!"

# Multiple recipients who are NOT the subjects
MULTIPLE_NON_SUBJECT: "Hello Mr. and Mrs. Miller, our records indicate that your temple recommends expire at the end of this month. The Bishopric has times this Sunday for recommend renewals. If you'd like to get on the schedule, please let me know!"
```

---

### `src/templates/messages/tithing-declaration.txt`

```
# Single recipient who IS the subject
SINGLE_SUBJECT: "Hello Morgan, this is a reminder of your tithing declaration appointment with Bishop Preece on Sunday at 10am. See you then!"

# Single recipient who is NOT the subject
SINGLE_NON_SUBJECT: "Hello Mr. Davis, this is a reminder of your son Morgan's tithing declaration appointment with Bishop Preece on Sunday at 10am. See you then!"

# Multiple recipients who ARE the subjects
MULTIPLE_SUBJECTS: "Hello Morgan and Riley, this is a reminder of your tithing declaration appointments with Bishop Preece on Sunday at 10am. See you then!"

# Multiple recipients who are NOT the subjects
MULTIPLE_NON_SUBJECT: "Hello Mr. and Mrs. Davis, this is a reminder of your children Morgan and Riley's tithing declaration appointments with Bishop Preece on Sunday at 10am. See you then!"
```

---

### `src/templates/messages/multiple-appointments.txt`

**NO CHANGES** — Keep existing placeholder syntax.

```
Hello {{greeting}}! Our records indicate the following appointments are needed:

{{bulletList}}

The Bishopric has times this Sunday. If you would like to get on our schedule, please let me know!
```

**Rationale**: Dynamic bullet list generation requires special handling. Keep using existing template substitution logic for this template.

---

## Grammar Permutation Logic

The LLM determines which example to use based on:

| Condition                                                                          | Example Selected       |
| ---------------------------------------------------------------------------------- | ---------------------- |
| `recipients` is a single string AND `subjects` is undefined or equals `recipients` | `SINGLE_SUBJECT`       |
| `recipients` is a single string AND `subjects` is different from `recipients`      | `SINGLE_NON_SUBJECT`   |
| `recipients` is an array AND `subjects` is undefined or equals `recipients`        | `MULTIPLE_SUBJECTS`    |
| `recipients` is an array AND `subjects` is different from `recipients`             | `MULTIPLE_NON_SUBJECT` |

This approach allows the LLM to handle all grammar automatically while maintaining predictable, template-adherent output.

---

## Migration Path

### Files to Update

#### 1. `src/utils/message-generator.ts`

**Current approach**:

```typescript
const template = loadTemplateContent(templateId);
const variables = buildTemplateVariables(scenario, templateId);
return substituteTemplate(template, variables);
```

**New approach**:

```typescript
const response = await fetch("/api/llm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    job: "format-sms",
    payload: {
      templateName: templateId,
      data: buildSimplifiedData(scenario),
    },
  }),
});

const { result } = await response.json();
return result.message;
```

**New function needed**:

```typescript
function buildSimplifiedData(
  scenario: MessageScenario,
): FormatSmsInput["data"] {
  // Extract recipients and subjects from scenario
  // recipients: who receives the message
  // subjects: who the appointment is about (optional - defaults to recipients)
  // Let LLM handle grammar, pronouns, verb conjugation, pluralization
}
```

**Example transformation**:

| Old Variable                  | New Field         | Example                              |
| ----------------------------- | ----------------- | ------------------------------------ |
| `{{recipients}}`              | `recipients`      | `"Jane"` or `["John", "Jane"]`       |
| `{{subjects}}` (if different) | `subjects`        | `"John"` (when recipients="Parents") |
| `{{who}}`                     | `withWhom`        | `"Bishop Preece"`                    |
| `{{date}}`                    | `date`            | `"Sunday"`                           |
| `{{time}}`                    | `time`            | `"2pm"`                              |
| `{{location}}`                | `location`        | `"after church"`                     |
| `{{appointmentType}}`         | `appointmentType` | `"baptismal interview"`              |

**New approach**:

```typescript
const response = await fetch("/api/llm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    job: "format-sms",
    payload: {
      templateName: templateId,
      data: buildSimplifiedData(scenario),
    },
  }),
});

const { result } = await response.json();
return result.message;
```

**New function needed**:

```typescript
function buildSimplifiedData(
  scenario: MessageScenario,
): FormatSmsInput["data"] {
  // Extract just the facts from scenario
  // Let LLM handle grammar, pronouns, verb conjugation
}
```

---

### Files to Deprecate (After Testing)

| File                                 | Status    | Notes                                    |
| ------------------------------------ | --------- | ---------------------------------------- |
| `src/utils/template-substitution.ts` | Keep      | Still needed for `multiple-appointments` |
| `src/utils/grammar.ts`               | Deprecate | LLM handles grammar automatically        |
| `src/utils/template-matcher.ts`      | Keep      | May still be needed                      |

---

## Environment Variables

### `.env.local`

```bash
# Groq API (for LLM inference)
GROQ_API_KEY=gsk_...
```

### `.env.local.example`

```bash
# Groq API (for LLM inference)
GROQ_API_KEY=
```

### Vercel Deployment

Add `GROQ_API_KEY` to Vercel project settings:

- Settings → Environment Variables
- Add for Production, Preview, and Development

---

## Testing

### Manual Testing

```bash
# 1. Start dev server
pnpm dev

# 2. Get session token from browser DevTools
# (Application → Cookies → next-auth.session-token)

# 3. Test API endpoint
curl -X POST http://localhost:3000/api/llm \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN_HERE" \
  -d '{
    "job": "format-sms",
    "payload": {
      "templateName": "baptismal-interview",
      "data": {
        "recipient": "Jane",
        "date": "Sunday",
        "time": "2pm",
        "location": "after church",
        "appointmentType": "baptismal interview",
        "withWhom": "Bishop Preece"
      }
    }
  }'
```

**Expected output**:

```json
{
  "result": {
    "message": "Hello Jane, are you available Sunday after church at 2pm for your baptismal interview with Bishop Preece?"
  }
}
```

---

### Unit Tests

#### `src/lib/llm/jobs/format-sms.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { formatSmsJob } from "./format-sms";

describe("formatSmsJob", () => {
  it("formats interview reminder", async () => {
    const result = await formatSmsJob.run({
      templateName: "interview-reminder",
      data: {
        recipient: "John",
        date: "Tuesday",
        time: "3pm",
        withWhom: "Bishop Preece",
      },
    });

    expect(result.message).toBeDefined();
    expect(result.message).toContain("John");
    expect(result.message).toContain("Tuesday");
    expect(result.message).toContain("3pm");
    expect(result.message).toContain("Bishop Preece");
  });

  it("handles baptismal interview with grammar", async () => {
    const result = await formatSmsJob.run({
      templateName: "baptismal-interview",
      data: {
        recipient: "Jane",
        date: "Sunday",
        time: "2pm",
        location: "after church",
        appointmentType: "baptismal interview",
        withWhom: "Bishop Preece",
      },
    });

    expect(result.message).toBeDefined();
    expect(result.message.toLowerCase()).toContain("jane");
    expect(result.message).toContain("are you available");
    expect(result.message).toContain("your");
  });
});
```

**Note**: Tests require `GROQ_API_KEY` in environment. For CI, add as GitHub secret.

---

## Cost Analysis

### Using `llama-3.1-8b-instant`

| Metric               | Value                          |
| -------------------- | ------------------------------ |
| Input cost           | $0.05 per 1M tokens            |
| Output cost          | $0.08 per 1M tokens            |
| Typical message      | ~200 input + ~50 output tokens |
| **Cost per message** | ~$0.000014                     |

**Monthly estimate** (1000 messages/month): ~$0.01

Essentially free for this use case.

---

## Vercel Constraints

| Concern             | Mitigation                                     |
| ------------------- | ---------------------------------------------- |
| 10s timeout (Hobby) | Groq responses typically <1s — not an issue    |
| 60s timeout (Pro)   | More than enough headroom                      |
| Bundle size         | `ai` + `@ai-sdk/groq` are lightweight          |
| Cold starts         | Singleton client pattern avoids overhead       |
| Rate limiting       | Wrap calls in try/catch, handle 429 gracefully |

---

## Implementation Checklist

### Phase 1: Core Infrastructure

- [ ] Create branch: `git checkout -b experiment/llm-integration`
- [ ] Install dependencies: `pnpm add ai @ai-sdk/groq zod`
- [ ] Create `src/lib/llm/` directory
- [ ] Implement `client.ts`
- [ ] Implement `types.ts`
- [ ] Implement `prompts.ts`

### Phase 2: Job System

- [ ] Implement `jobs/format-sms.ts`
- [ ] Implement `jobs/parse-message.ts`
- [ ] Implement `jobs/index.ts`

### Phase 3: API Layer

- [ ] Create `src/app/api/llm/route.ts`
- [ ] Add NextAuth protection
- [ ] Test endpoint with curl

### Phase 4: Template Migration

- [ ] Update `interview-reminder.txt`
- [ ] Update `baptismal-interview.txt`
- [ ] Update `bishop-youth-interview.txt`
- [ ] Update `counselor-youth-interview.txt`
- [ ] Update `extend-calling.txt`
- [ ] Update `setting-apart.txt`
- [ ] Update `temple-recommend-renewal.txt`
- [ ] Update `tithing-declaration.txt`
- [ ] Verify `multiple-appointments.txt` unchanged

### Phase 5: Integration

- [ ] Update `src/utils/message-generator.ts` to call LLM API
- [ ] Implement `buildSimplifiedData()` function
- [ ] Test message generation end-to-end

### Phase 6: Environment & Deployment

- [ ] Add `GROQ_API_KEY` to `.env.local`
- [ ] Add `GROQ_API_KEY` to `.env.local.example`
- [ ] Run `pnpm lint`
- [ ] Run `pnpm build` (type check)
- [ ] Deploy to Vercel preview
- [ ] Add `GROQ_API_KEY` to Vercel environment variables

### Phase 7: Testing

- [ ] Add unit tests for `format-sms` job
- [ ] Add unit tests for `parse-message` job
- [ ] Manual testing of all 8 templates
- [ ] Test error handling (invalid job name, API failure)
- [ ] Test authentication (unauthorized request)

### Phase 8: Cleanup

- [ ] Identify deprecated code in `grammar.ts`
- [ ] Document migration from old template system
- [ ] Update AGENTS.md if needed

---

## Rollback Plan

If issues arise:

1. **Revert templates**: Restore original placeholder syntax
2. **Revert message-generator.ts**: Return to template substitution
3. **Disable API route**: Add feature flag or remove route
4. **Keep LLM infrastructure**: Doesn't affect existing code until called

---

## Future Enhancements

### Potential Additions

1. **Rate limiting** on `/api/llm` endpoint
2. **Caching** for repeated identical requests
3. **Fallback model** (switch to `balanced` if `fast` fails)
4. **Analytics** — track token usage per job
5. **Batch processing** for multiple messages
6. **A/B testing** — compare LLM vs old system output

### New Job Ideas

1. **`summarize-youth-visit`** — Generate summary from visit notes
2. **`extract-action-items`** — Pull to-dos from Slack messages
3. **`categorize-message`** — Classify inbound message type
4. **`translate-message`** — Multi-language support

---

## References

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Schema Validation](https://zod.dev/)

---

## Notes

- **Temperature 0** ensures consistent output across calls
- **Natural example templates** eliminate complex placeholder logic
- **Grammar permutations** in templates (recipient=subject, recipient≠subject, multiple) allow LLM to pick the right example
- **Separate recipients/subjects fields** allow precise control over grammar
- **LLM handles grammar** — no more `{{availabilityVerb}}`, `{{possessive}}`, etc.
- **Full replacement** means cleaner codebase, no dual systems to maintain
- **Special case handling** for `multiple-appointments` preserves working logic

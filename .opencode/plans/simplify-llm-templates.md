# Plan: Simplify LLM Template System

## Goal

Remove scenario permutations from template files and rely on LLM to generate correct grammar variations based on a single default template.

---

## Current State

### Template Files (e.g., `extend-calling.txt`)

```
# Single recipient who IS the subject
SINGLE_SUBJECT: "Hello Brother {Lastname}, are you available..."

# Single recipient who is NOT the subject
SINGLE_NON_SUBJECT: "Hello Brother {Lastname}, is {subject} available..."

# Multiple recipients who ARE the subjects
MULTIPLE_SUBJECTS: "Hello Brother {Lastname1} and Sister {Lastname2}, are you both available..."

# Multiple recipients who are NOT the subjects
MULTIPLE_NON_SUBJECT: "Hello Brother {Lastname1} and Sister {Lastname2}, are {subjects} available..."
```

### Current Data Structure

```typescript
{
  recipients: [{ firstName, lastName, gender }],
  lastName: "Wilson",
  time: "2pm",
  beforeOrAfterChurch: "after church",
  subject: "John"  // or subjects: "John and Mary"
}
```

### Current Prompt

Sends entire .txt file with all 4 examples, causing LLM to sometimes generate multiple versions.

---

## Target State

### Simplified Template Files

```
TEMPLATE: "Hello {recipient}, are you available Sunday {beforeOrAfterChurch} at {time} to meet with a member of the Bishopric?"
```

### New Data Structure

```typescript
{
  template: "Hello {recipient}, are you available Sunday {beforeOrAfterChurch} at {time} to meet with a member of the Bishopric?",
  recipients: ["Brother Smith (M)"],
  subjects: ["Mary (F)"],           // optional - omit if recipients are subjects
  meetingTime: "2pm",               // optional
  churchEndTime: "12:30"            // optional
}
```

### New Prompt

```
You are an SMS message generator. Output exactly ONE final message. No alternatives, no explanations, no labels.

## INPUTS
- TEMPLATE: The base message structure to follow exactly
- RECIPIENTS: One or more entries in "Title Lastname (Gender)" format (e.g., "Brother Smith (M)")
- SUBJECT (optional): One or more entries in "Firstname (Gender)" format (e.g., "Mary (F)"). If omitted, recipients are the subject.
- MEETING TIME (optional): Proposed meeting time
- CHURCH END TIME (optional): When church ends. Required only if MEETING TIME is provided.

## RULES

**Before/after church:** If MEETING TIME is after CHURCH END TIME → "after church", otherwise → "before church". Skip if no MEETING TIME.

**Recipient addressing:**
- Single recipient → "Title Lastname"
- Multiple recipients, same lastname, recipients = subjects → "Title Lastname and Title Lastname"
- Multiple recipients, same lastname, recipients ≠ subjects → "Title and Title Lastname"
- Multiple recipients, different lastnames → "Title Lastname and Title Lastname"

**Gender pronouns (use subject's gender when subject ≠ recipients, otherwise recipient's):**
- (M) → he / him / his / himself
- (F) → she / her / hers / herself
- Multiple mixed or unspecified → they / them / their / themselves

**Grammar based on recipient/subject relationship:**
- Single recipient = subject → "you / your / yourself", passive voice, singular nouns
- Single recipient ≠ subject → subject's first name + possessive ("Mary's"), gender pronouns, active voice, singular nouns
- Multiple recipients = subjects → "you both / your / yourselves", passive voice, pluralize nouns where appropriate
- Multiple recipients ≠ subjects → subjects by first name + possessive ("Mary and Joe's"), gender pronouns, active voice, pluralize nouns where appropriate

Follow the template's structure, tone, and punctuation exactly. Only substitute the provided values and inferred grammatical forms.

## OUTPUT
The final SMS text only.
```

---

## Implementation Steps

### Step 1: Update Template Files

**Files:** `src/templates/messages/*.txt`

Replace all 4 scenario examples with a single template using placeholder syntax:

```
TEMPLATE: "Hello {recipient}, are you available Sunday {beforeOrAfterChurch} at {time} to meet with a member of the Bishopric?"
```

**Templates to update:**

- [ ] `extend-calling.txt`
- [ ] `setting-apart.txt`
- [ ] `interview-reminder.txt`
- [ ] `bishop-youth-interview.txt`
- [ ] `counselor-youth-interview.txt`
- [ ] `temple-recommend-renewal.txt`
- [ ] `tithing-declaration.txt`
- [ ] `baptismal-interview.txt`
- [ ] `multiple-appointments.txt` (may need special handling)

### Step 2: Update Prompt

**File:** `src/lib/llm/prompts.ts`

Replace `PROMPTS.formatSms` with the new comprehensive prompt above.

### Step 3: Update Data Builder

**File:** `src/utils/message-generator.ts`

Update `buildSimplifiedData()` to output:

```typescript
function buildSimplifiedData(
  scenario: MessageScenario,
  templateId: string,
): Record<string, unknown> {
  const { recipients, subjects, recipientsAreSubjects, selectedTime } =
    scenario;

  // Format recipients: ["Brother Smith (M)", "Sister Jones (F)"]
  const recipientStrings = recipients.map((r) => {
    const parts = r.name.split(",");
    const lastName = parts[0]?.trim() || r.name;
    const gender = (r as any).gender || "M";
    const title = gender === "M" ? "Brother" : "Sister";
    return `${title} ${lastName} (${gender})`;
  });

  const result: Record<string, unknown> = {
    template: loadTemplateContent(templateId), // Just the TEMPLATE line
    recipients: recipientStrings,
  };

  // Add subjects only if recipients are NOT subjects
  if (!recipientsAreSubjects && subjects.length > 0) {
    const subjectStrings = subjects.map((s) => {
      const parts = s.name.split(",");
      const firstName = parts[1]?.trim()?.split(" ")[0] || s.name.split(" ")[0];
      const gender = (s as any).gender || "M";
      return `${firstName} (${gender})`;
    });
    result.subjects = subjectStrings;
  }

  // Add time info if provided
  if (selectedTime) {
    result.meetingTime = selectedTime;
    result.churchEndTime = CHURCH_END_TIME; // "12:30"
  }

  return result;
}
```

### Step 4: Update LLM Job

**File:** `src/lib/llm/jobs/format-sms.ts`

Update the prompt construction:

```typescript
async run(input) {
  const { template, recipients, subjects, meetingTime, churchEndTime } = input.data;

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
    ].filter(Boolean).join("\n"),
  });

  return { message: text.trim() };
}
```

### Step 5: Remove Debug Logs

**Files:**

- `src/utils/message-generator.ts`
- `src/app/api/llm/route.ts`

Remove all `console.log` debug statements added during troubleshooting.

### Step 6: Clean Up

- Remove `retryCount` state from ContactRow and GroupCard (no longer needed)
- Remove `onRetry` prop from MessagePreview (no longer needed)
- Simplify `canGenerate` logic if needed

---

## Testing Checklist

- [ ] Single recipient who IS subject → "Hello Brother Smith, are you available..."
- [ ] Single recipient who is NOT subject → "Hello Brother Smith, is Mary available..."
- [ ] Multiple recipients who ARE subjects → "Hello Brother Smith and Sister Jones, are you both available..."
- [ ] Multiple recipients who are NOT subjects → "Hello Brother Smith and Sister Jones, are Mary and John available..."
- [ ] Before church time → "before church"
- [ ] After church time → "after church"
- [ ] Gender pronouns correct (he/she/they)
- [ ] Only ONE message generated (not 4 versions)
- [ ] No extra text/explanations in output

---

## Risks & Mitigations

| Risk                                       | Mitigation                                            |
| ------------------------------------------ | ----------------------------------------------------- |
| LLM doesn't follow grammar rules correctly | Comprehensive rules in prompt + temperature 0         |
| LLM adds explanations                      | Explicit "OUTPUT ONLY the final SMS text" instruction |
| Gender inference fails                     | Always pass explicit (M)/(F) in data                  |
| Template placeholder confusion             | Use clear {placeholder} syntax                        |

---

## Rollback Plan

If LLM output is unreliable:

1. Keep backup of original .txt files with 4 examples
2. Can revert to pre-selecting single example (Option A) if needed
3. Consider adding example output in prompt if grammar rules insufficient

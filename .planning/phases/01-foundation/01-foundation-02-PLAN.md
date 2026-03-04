---
phase: 01-foundation
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/requests/cards/types.ts
  - src/requests/cards/requests.ts
  - src/utils/transformers.ts
autonomous: true

must_haves:
  truths:
    - ContactCard type includes phone number field
    - Phone number extracted from Trello card description
    - Trello fetcher accepts additional fields parameter for desc
    - Data transformation pipeline uses existing rambdax patterns
  artifacts:
    - path: "src/requests/cards/types.ts"
      provides: "ContactCard type definition"
      contains: "interface ContactCard"
      min_lines: 5
    - path: "src/requests/cards/requests.ts"
      provides: "fetchContactCards function"
      exports: ["fetchContactCards"]
      min_lines: 10
    - path: "src/utils/transformers.ts"
      provides: "buildContactCard transformer"
      exports: ["buildContactCard"]
      min_lines: 10
  key_links:
    - from: "src/requests/cards/requests.ts"
      to: "src/utils/transformers.ts"
      via: "import statement for buildContactCard"
      pattern: "import.*buildContactCard.*from.*transformers"
    - from: "src/requests/cards/types.ts"
      to: "src/requests/cards/types.ts"
      via: "extends TrelloCard"
      pattern: "extends TrelloCard"
    - from: "src/requests/cards/requests.ts"
      to: "Trello API"
      via: "fetch with desc field"
      pattern: "additionalFields.*desc"
---

<objective>
Create Trello contact data types and fetcher with phone number extraction.

Purpose: Read appointment contacts from Trello lists with phone numbers for message generation.
Output: ContactCard type, fetchContactCards function, buildContactCard transformer.
</objective>

<execution_context>
@/Users/kjc/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kjc/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation/01-RESEARCH.md

# Existing patterns to follow
@src/requests/cards/types.ts
@src/requests/cards/requests.ts
@src/utils/transformers.ts
</context>

<tasks>

<task type="auto">
  <name>Add ContactCard type with phone support</name>
  <files>src/requests/cards/types.ts</files>
  <action>Add ContactCard interface to src/requests/cards/types.ts:

1. Import Label from same file (already exists)
2. Add ContactCard interface extending TrelloCard:
   ```typescript
   export interface ContactCard extends TrelloCard {
     kind: "contact";
     phone?: string;
     labels?: Label[];
   }
   ```

The phone field is optional (contact cards may not have phone numbers in Trello yet).
The kind property distinguishes contacts from interviews/callings.

DO NOT:
- Remove or modify existing types (InterviewTrelloCard, CallingTrelloCard, TrelloCard)
- Make phone required - Trello cards may not have phone data initially
- Add other contact-specific fields yet (those come in later phases)
</action>
  <verify>Run: grep -n "interface ContactCard" src/requests/cards/types.ts - should show the interface definition</verify>
  <done>ContactCard interface exists in types.ts with phone?: string field</done>
</task>

<task type="auto">
  <name>Add contact fetcher to requests.ts</name>
  <files>src/requests/cards/requests.ts</files>
  <action>Add fetchContactCards function to src/requests/cards/requests.ts:

1. Import ContactCard type from ./types
2. Import buildContactCard from @/utils/transformers (will add in next task)
3. Create fetchContactCards function:
   ```typescript
   const fetchContactCards = async (
     listId: string,
   ): Promise<ContactCard[]> => {
     // Fetch cards with description and labels (for phone extraction)
     const apiCards = await fetchCards(listId, ["desc", "labels"]);

     return await pipeAsync<ContactCard[]>(
       // Filter cards (reuse existing transform or create new filter)
       transformTrelloCards,
       // Transform to ContactCard with phone extraction
       map(buildContactCard),
     )(apiCards);
   };
   ```

4. Export fetchContactCards along with existing exports

Follow existing patterns:
- Use fetchCards from same file (already defined)
- Use pipeAsync, map from rambdax (already imported)
- Return Promise<ContactCard[]>

DO NOT:
- Hardcode list IDs (that comes in Plan 03)
- Create separate API call - reuse existing fetchCards
- Add error handling beyond what fetchCards provides (follow existing pattern)
</action>
  <verify>Run: grep -n "fetchContactCards" src/requests/cards/requests.ts - should show function definition and export</verify>
  <done>fetchContactCards function exists and is exported from requests.ts</done>
</task>

<task type="auto">
  <name>Create buildContactCard transformer with phone extraction</name>
  <files>src/utils/transformers.ts</files>
  <action>Add buildContactCard function to src/utils/transformers.ts:

1. Import ContactCard type from @/requests/cards
2. Create extractPhoneFromDescription helper function:
   ```typescript
   const extractPhoneFromDescription = (desc: string): string | undefined => {
     if (!desc) return undefined;
     // Match "Phone: number" pattern in description
     const phoneMatch = desc.match(/Phone:\s*([0-9\-\(\)\s]+?)(?:\n|$)/i);
     return phoneMatch ? phoneMatch[1].trim() : undefined;
   };
   ```

3. Create buildContactCard function using pipe:
   ```typescript
   export const buildContactCard = pipe(
     // Extract phone from description
     (card: TrelloCard) => ({
       ...card,
       phone: extractPhoneFromDescription((card as any).desc || ""),
     }),
     // Set kind to "contact"
     assoc("kind", "contact" as const),
   );
   ```

Follow existing patterns:
- Use pipe, assoc from rambdax (already imported)
- Type cast card to access desc field (TrelloCard doesn't have desc, but fetchCards adds it)
- Return ContactCard type

DO NOT:
- Modify existing transformer functions (buildInterviewTrelloCard, buildCallingTrelloCard)
- Add complex phone validation - just extract what's there
- Handle custom fields (desc parsing is simpler and sufficient for v1)
</action>
  <verify>Run: grep -n "buildContactCard" src/utils/transformers.ts - should show function definition and export</verify>
  <done>buildContactCard function exists with phone extraction logic</done>
</task>

</tasks>

<verification>
Run these checks after completion:

1. Type definition:
   ```bash
   grep -A 5 "interface ContactCard" src/requests/cards/types.ts
   ```
   Should show extends TrelloCard with phone field

2. Fetcher function:
   ```bash
   grep -A 10 "fetchContactCards" src/requests/cards/requests.ts
   ```
   Should show function using fetchCards with ["desc", "labels"]

3. Transformer function:
   ```bash
   grep -A 15 "extractPhoneFromDescription" src/utils/transformers.ts
   ```
   Should show regex pattern for phone extraction

4. Imports are correct (no TypeScript errors):
   The code should compile without errors
</verification>

<success_criteria>
- ContactCard type extends TrelloCard with phone?: string field
- fetchContactCards function fetches cards with desc and labels fields
- buildContactCard extracts phone from description using regex
- All functions follow existing rambdax patterns (pipe, pipeAsync, map)
- No modifications to existing types or functions
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-02-SUMMARY.md` with:
- ContactCard type structure
- Phone extraction regex pattern
- How the fetcher transforms raw Trello data
- Notes on desc vs custom field decision (desc chosen for v1)
</output>

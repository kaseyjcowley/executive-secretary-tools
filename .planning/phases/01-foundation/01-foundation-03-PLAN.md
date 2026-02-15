---
phase: 01-foundation
plan: 03
type: execute
wave: 2
depends_on: ["01-foundation-01", "01-foundation-02"]
files_modified:
  - src/app/api/contacts/route.ts
  - src/constants.ts
autonomous: true

must_haves:
  truths:
    - API route returns contact data from Trello lists
    - List IDs are configurable via environment variable
    - API handles errors gracefully (returns empty array on failure)
    - Multiple list IDs can be specified (comma-separated)
  artifacts:
    - path: "src/app/api/contacts/route.ts"
      provides: "Contacts API endpoint"
      exports: ["GET"]
      contains: "GET.*fetchContactCards"
      min_lines: 30
    - path: "src/constants.ts"
      provides: "Trello list ID configuration"
      contains: "APPOINTMENT_LIST_IDS"
      min_lines: 1
  key_links:
    - from: "src/app/api/contacts/route.ts"
      to: "src/requests/cards/requests.ts"
      via: "import fetchContactCards"
      pattern: "import.*fetchContactCards.*from.*requests"
    - from: "src/app/api/contacts/route.ts"
      to: "src/constants.ts"
      via: "import APPOINTMENT_LIST_IDS"
      pattern: "import.*APPOINTMENT_LIST_IDS.*from.*constants"
    - from: "src/constants.ts"
      to: "process.env"
      via: "APPOINTMENT_LIST_IDS uses environment variable"
      pattern: "APPOINTMENT_LIST_IDS.*process\\.env"
---

<objective>
Create API route for fetching contacts and add configurable Trello list IDs.

Purpose: Provide HTTP endpoint to fetch contact data and make list IDs configurable for different Trello boards.
Output: /api/contacts endpoint, APPOINTMENT_LIST_IDS constant.
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
@src/app/api/interviews/route.ts
@src/constants.ts
</context>

<tasks>

<task type="auto">
  <name>Add contacts API route</name>
  <files>src/app/api/contacts/route.ts</files>
  <action>Create src/app/api/contacts/route.ts with GET endpoint:

1. Import ContactCard type from @/requests/cards
2. Import fetchContactCards from @/requests/cards/requests
3. Import APPOINTMENT_LIST_IDS from @/constants

4. Create GET function:
   ```typescript
   import { NextResponse } from "next/server";
   import { ContactCard } from "@/requests/cards";
   import { fetchContactCards } from "@/requests/cards/requests";
   import { APPOINTMENT_LIST_IDS } from "@/constants";

   export async function GET() {
     try {
       const listIds = APPOINTMENT_LIST_IDS;

       if (!listIds || listIds.length === 0) {
         return NextResponse.json({ contacts: [] });
       }

       // Fetch from all configured lists in parallel
       const allContacts = await Promise.all(
         listIds.map((listId) => fetchContactCards(listId))
       );

       return NextResponse.json({
         contacts: allContacts.flat(),
       });
     } catch (error) {
       console.error("Error fetching contacts:", error);
       return NextResponse.json(
         { contacts: [], error: "Failed to fetch contacts" },
         { status: 500 }
       );
     }
   }
   ```

Follow existing patterns from src/app/api/interviews/route.ts (NextResponse.json, try-catch)

DO NOT:
- Add POST endpoint (not needed yet)
- Add authentication (existing pattern doesn't require it for read-only data)
- Return raw Trello data (should be transformed ContactCard type)
- Add pagination (not needed for appointment lists)
</action>
  <verify>Run: curl http://localhost:3000/api/contacts - should return JSON with contacts array (or error if no list IDs configured)</verify>
  <done>GET /api/contacts returns JSON with contacts array from configured Trello lists</done>
</task>

<task type="auto">
  <name>Add configurable appointment list IDs</name>
  <files>src/constants.ts</files>
  <action>Add APPOINTMENT_LIST_IDS constant to src/constants.ts:

1. Read existing constants.ts file to understand the pattern
2. Add APPOINTMENT_LIST_IDS constant:
   ```typescript
   // Trello list IDs for appointment contacts (comma-separated in env var)
   export const APPOINTMENT_LIST_IDS: string[] = process.env
     .APPOINTMENT_LIST_IDS?.split(",")
     .filter(Boolean) || [];
   ```

The constant:
- Reads from process.env.APPOINTMENT_LIST_IDS (comma-separated values)
- Splits on comma to create array of strings
- Filters out empty strings (handles trailing commas, empty values)
- Returns empty array if env var not set

Add a comment explaining the format:
```typescript
// Trello list IDs for appointment messaging system
// Format: "listId1,listId2,listId3"
// To get list IDs: Open Trello list, check URL: /b/{boardId}/{listName}?l={listId}
```

DO NOT:
- Hardcode list IDs (use environment variable per best practice)
- Add validation for list ID format (Trello will return empty for invalid IDs)
- Create separate APPOINTMENT_LIST_ID singular (use array for multiple lists)
- Modify other constants in the file
</action>
  <verify>Run: grep -n "APPOINTMENT_LIST_IDS" src/constants.ts - should show constant definition</verify>
  <done>APPOINTMENT_LIST_IDS constant exists and reads from process.env.APPOINTMENT_LIST_IDS</done>
</task>

</tasks>

<verification>
Run these checks after completion:

1. API route exists:
   ```bash
   ls -la src/app/api/contacts/route.ts
   ```

2. API returns JSON:
   ```bash
   curl -s http://localhost:3000/api/contacts | jq .
   ```
   Should show { contacts: [...] }

3. List IDs constant:
   ```bash
   grep -A 5 "APPOINTMENT_LIST_IDS" src/constants.ts
   ```
   Should show env var reading logic

4. Error handling works:
   Set invalid APPOINTMENT_LIST_IDS and verify empty array returned (no crash)
</verification>

<success_criteria>
- /api/contacts endpoint returns ContactCard[] in JSON format
- APPOINTMENT_LIST_IDS reads from environment variable and splits on comma
- API handles errors gracefully (returns empty array with error message)
- No hardcoded list IDs in source code
- Endpoint is accessible without authentication (read-only data)
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-03-SUMMARY.md` with:
- API endpoint structure
- Environment variable format (APPOINTMENT_LIST_IDS)
- How to find list IDs in Trello
- Error handling strategy
</output>

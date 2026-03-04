---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified: [src/utils/contact-fuzzy-match.ts]
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "Fuse.js fuzzy matching uses members.json as the source data"
    - "DirectoryEntry interface includes gender field (m/f strings)"
    - "Empty phone numbers are handled gracefully (returns undefined)"
    - "Trello card names are fuzzy-matched against member names from members.json"
  artifacts:
    - path: "src/utils/contact-fuzzy-match.ts"
      provides: "Fuse.js fuzzy matching using members.json"
      exports: ["matchContact", "DirectoryEntry"]
      min_lines: 20
  key_links:
    - from: "src/utils/contact-fuzzy-match.ts"
      to: "src/data/members.json"
      via: "import members from '@/data/members.json'"
      pattern: "import.*members"
---

<objective>
Update Fuse.js fuzzy matching implementation to use members.json as the contact directory source.

Purpose: Switch from the sample directory.json to the actual members.json file containing real church member data (names, ages, genders, phone numbers) for accurate contact matching.

Output: Fuzzy matching utility that uses members.json for enriching Trello contacts with phone numbers.
</objective>

<execution_context>
@/Users/kjc/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kjc/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/utils/contact-fuzzy-match.ts
@src/data/members.json
@src/app/api/contacts/route.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update fuzzy matching utility to use members.json</name>
  <files>src/utils/contact-fuzzy-match.ts</files>
  <action>
    Update src/utils/contact-fuzzy-match.ts to use members.json:

    1. Change import from directory.json to members.json:
       `import members from '@/data/members.json'`

    2. Update DirectoryEntry interface to include gender field:
       ```typescript
       export interface DirectoryEntry {
         name: string;
         age: number;
         gender: string; // 'm' or 'f'
         phone: string;
       }
       ```

    3. Update Fuse initialization to use members instead of directory:
       `const fuse = new Fuse(members as DirectoryEntry[], { ... })`

    4. Update matchContact function to handle empty phone numbers:
       - Add check: `if (bestMatch.score !== undefined && bestMatch.score < 0.4 && bestMatch.item.phone)`
       - Only return phone if score < 0.4 AND phone is not empty string

    Do NOT modify the Fuse options (threshold, keys, includeScore) - keep existing fuzzy matching configuration.
  </action>
  <verify>
    1. `grep "import.*members" src/utils/contact-fuzzy-match.ts` confirms import
    2. `grep "gender: string" src/utils/contact-fuzzy-match.ts` confirms interface update
    3. `npx tsc --noEmit` compiles without errors
  </verify>
  <done>
    Fuzzy matching utility updated to use members.json with gender field support and empty phone handling
  </done>
</task>

</tasks>

<verification>
- Import statement references members.json instead of directory.json
- DirectoryEntry interface includes gender field
- matchContact handles empty phone numbers (returns undefined for empty strings)
- TypeScript compilation succeeds
- Existing API route (/api/contacts) continues to work with updated implementation
</verification>

<success_criteria>
Fuse.js fuzzy matching now uses members.json for contact enrichment, supporting the gender field and gracefully handling empty phone numbers in the data.
</success_criteria>

<output>
After completion, create `.planning/quick/2-there-is-now-a-members-json-file-located/2-SUMMARY.md`
</output>

---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified: [package.json, src/data/directory.json, src/utils/contact-fuzzy-match.ts, src/app/api/contacts/route.ts]
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "Contacts from Trello cards have phone numbers from fuzzy-matched directory entries"
    - "Fuse.js fuzzy matching returns best matches for contact names"
    - "Phone numbers are enriched in Contact objects returned by /api/contacts"
  artifacts:
    - path: "package.json"
      provides: "Fuse.js dependency"
      contains: "fuse.js"
    - path: "src/data/directory.json"
      provides: "Contact directory with names/ages/phone numbers"
      min_lines: 3
    - path: "src/utils/contact-fuzzy-match.ts"
      provides: "Fuse.js fuzzy matching utility"
      exports: ["matchContact"]
    - path: "src/app/api/contacts/route.ts"
      provides: "Enriched contacts API with phone numbers"
      exports: ["GET"]
  key_links:
    - from: "src/app/api/contacts/route.ts"
      to: "src/data/directory.json"
      via: "import in contact-fuzzy-match.ts"
      pattern: "import.*directory"
    - from: "src/app/api/contacts/route.ts"
      to: "src/utils/contact-fuzzy-match.ts"
      via: "import and usage for matching"
      pattern: "matchContact"
---

<objective>
Create a Fuse.js-based fuzzy matching system to enrich Trello contact cards with phone numbers from a JSON directory file.

Purpose: Automatically match Trello card names against a directory of contacts (names/ages/phone numbers) to pre-fill phone numbers for messaging, reducing manual entry.

Output: Contacts API returns phone numbers from fuzzy-matched directory entries.
</objective>

<execution_context>
@/Users/kjc/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kjc/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/ContactList.tsx
@src/types/messages.ts
@src/app/api/contacts/route.ts
@src/requests/cards/types.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Fuse.js and create directory data file</name>
  <files>package.json, src/data/directory.json</files>
  <action>
    1. Install Fuse.js: `npm install fuse.js`
    2. Create sample directory.json in src/data/ with structure:
       ```json
       [
         {
           "name": "John Smith",
           "age": 35,
           "phone": "555-123-4567"
         },
         {
           "name": "Jane Doe",
           "age": 42,
           "phone": "555-987-6543"
         }
       ]
       ```
    Do NOT use TypeScript type definitions (.d.ts) - Fuse.js ships with built-in types.
  </action>
  <verify>
    1. `cat package.json | grep "fuse.js"` confirms installation
    2. `cat src/data/directory.json` is valid JSON and contains at least 3 sample entries
  </verify>
  <done>
    Fuse.js package installed and sample directory.json file created with at least 3 contacts
  </done>
</task>

<task type="auto">
  <name>Task 2: Create fuzzy matching utility with Fuse.js</name>
  <files>src/utils/contact-fuzzy-match.ts</files>
  <action>
    Create src/utils/contact-fuzzy-match.ts with:

    1. Import Fuse.js: `import Fuse from 'fuse.js'`
    2. Import directory JSON: `import directory from '@/data/directory.json'`
    3. Define DirectoryEntry interface: `{ name: string; age: number; phone: string }`
    4. Create matchContact(name: string): string | undefined function:
       - Initialize Fuse instance with directory entries and options:
         - keys: ['name']
         - threshold: 0.4 (for fuzzy matching tolerance)
         - includeScore: true
       - Search for the name
       - Return phone of top match if score < 0.4, else undefined
       - Handle exact matches (score = 0)
    Do NOT use type assertions or any casts - let TypeScript infer types.
  </action>
  <verify>
    1. `cat src/utils/contact-fuzzy-match.ts` exists and exports matchContact
    2. TypeScript compiles without errors: `npx tsc --noEmit`
  </verify>
  <done>
    Fuzzy matching utility created that accepts a name string and returns a phone number (or undefined)
  </done>
</task>

<task type="auto">
  <name>Task 3: Enrich contacts API with fuzzy-matched phone numbers</name>
  <files>src/app/api/contacts/route.ts</files>
  <action>
    Update src/app/api/contacts/route.ts to enrich contacts with phone numbers:

    1. Import matchContact utility: `import { matchContact } from '@/utils/contact-fuzzy-match'`
    2. After combining contacts array (line 35), map over contacts and add phone field:
       ```typescript
       const enrichedContacts = contacts.map(contact => ({
         ...contact,
         phone: matchContact(contact.name) || undefined
       }));
       ```
    3. Return enrichedContacts instead of contacts in response
    Do NOT modify existing contact fetching logic - only add the enrichment step.
  </action>
  <verify>
    1. API returns contacts with phone field: Test by visiting /api/contacts endpoint
    2. Fuzzy matches work: Try a name similar to directory entries (e.g., "John Smithy" should match "John Smith")
  </verify>
  <done>
    Contacts API returns phone numbers from fuzzy-matched directory entries for all Trello card contacts
  </done>
</task>

</tasks>

<verification>
- Fuse.js is properly installed in package.json
- directory.json file exists with sample data
- contact-fuzzy-match.ts exports matchContact function
- /api/contacts endpoint returns contacts enriched with phone numbers
- Fuzzy matching handles slight variations in names (typos, partial matches)
- Returns undefined when no good match found (score >= 0.4)
</verification>

<success_criteria>
Contacts returned by /api/contacts include phone numbers that are fuzzy-matched against the directory.json file, enabling pre-filled phone numbers in ContactList component.
</success_criteria>

<output>
After completion, create `.planning/quick/1-create-a-system-that-uses-fuse-js-to-loa/1-SUMMARY.md`
</output>

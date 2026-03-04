---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified: [src/components/ContactRow.tsx]
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "ContactRow displays a dropdown with all member names from members.json"
    - "Dropdown value is the member's phone number"
    - "Dropdown is pre-selected to the best fuzzy match on page load"
    - "User can manually select a different member from the dropdown"
    - "Dropdown appears in the ContactRow UI alongside template selection"
  artifacts:
    - path: "src/components/ContactRow.tsx"
      provides: "Contact row with member selection dropdown"
      contains: "useState for selected phone, useEffect for fuzzy match, select with members"
      min_lines: 60
  key_links:
    - from: "src/components/ContactRow.tsx"
      to: "src/utils/contact-fuzzy-match.ts"
      via: "import matchContact"
      pattern: "import.*matchContact"
    - from: "src/components/ContactRow.tsx"
      to: "src/data/members.json"
      via: "import members from '@/data/members.json'"
      pattern: "import.*members"
---

<objective>
Add a member selection dropdown to ContactRow.tsx that pre-selects based on fuzzy match and allows manual selection.

Purpose: Enable users to verify and correct the fuzzy-matched phone number by selecting from a dropdown of all members in members.json. The dropdown shows member names, stores phone numbers as values, and auto-selects the best fuzzy match on load.

Output: ContactRow component with member dropdown showing names, values as phone numbers, and fuzzy-matched default selection.
</objective>

<execution_context>
@/Users/kjc/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kjc/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/ContactRow.tsx
@src/utils/contact-fuzzy-match.ts
@src/data/members.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add member dropdown to ContactRow with fuzzy match pre-selection</name>
  <files>src/components/ContactRow.tsx</files>
  <action>
    Add member selection dropdown to ContactRow.tsx:

    1. Import dependencies at top of file:
       ```typescript
       import { useEffect } from "react";
       import members from "@/data/members.json";
       import { matchContact } from "@/utils/contact-fuzzy-match";
       ```

    2. Add state for selected phone number (after existing selectedTemplateId state):
       ```typescript
       const [selectedPhone, setSelectedPhone] = useState<string | undefined>();
       ```

    3. Add useEffect to fuzzy match and pre-select phone on mount:
       ```typescript
       useEffect(() => {
         const matchedPhone = matchContact(contact.name);
         setSelectedPhone(matchedPhone);
       }, [contact.name]);
       ```

    4. Add member dropdown in the UI, placing it in the contact info section (after the contact name/labels span, before the "---" separator):
       ```tsx
       <select
         className="md:ml-4 p-2 border border-slate-300 rounded text-slate-900 text-sm"
         value={selectedPhone || ""}
         onChange={(e) => setSelectedPhone(e.target.value)}
       >
         <option value="" disabled>
           Select member (or verify fuzzy match)
         </option>
         {members.map((member) => (
           <option key={member.name} value={member.phone}>
             {member.name}
           </option>
         ))}
       </select>
       ```

    Maintain existing styling patterns (Tailwind classes) and keep all other functionality intact (template selection, time picker, preview).
  </action>
  <verify>
    1. `grep "import.*members" src/components/ContactRow.tsx` confirms members import
    2. `grep "import.*matchContact" src/components/ContactRow.tsx` confirms matchContact import
    3. `grep "useState.*selectedPhone" src/components/ContactRow.tsx` confirms state added
    4. `grep "useEffect.*matchContact" src/components/ContactRow.tsx` confirms fuzzy match on mount
    5. `npx tsc --noEmit` compiles without errors
  </verify>
  <done>
    ContactRow now displays member dropdown with all names from members.json, values as phone numbers, and auto-selects best fuzzy match on page load
  </done>
</task>

</tasks>

<verification>
- Members dropdown displays all names from members.json
- Dropdown value is member's phone number
- Default selection is best fuzzy match from matchContact()
- User can manually select different member
- Existing ContactRow functionality (template selection, preview) remains intact
- TypeScript compilation succeeds
</verification>

<success_criteria>
ContactRow component now includes a member selection dropdown that shows all names from members.json, uses phone numbers as values, and pre-selects the best fuzzy match on initial load.
</success_criteria>

<output>
After completion, create `.planning/quick/3-now-that-we-have-phone-number-and-contac/3-SUMMARY.md`
</output>

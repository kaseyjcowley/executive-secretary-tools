---
phase: 02-contact-display-template-selection
plan: 03
type: execute
wave: 2
depends_on: ["02-contact-display-template-selection-01", "02-contact-display-template-selection-02"]
files_modified:
  - src/utils/contact-ordering.ts
  - src/components/ContactList.tsx
  - src/app/messages/page.tsx
  - src/utils/template-loader.ts
autonomous: true

must_haves:
  truths:
    - "Contacts with 'calling' labels appear first in the list"
    - "Contacts with 'interview' labels appear after calling contacts"
    - "All other contacts appear after calling and interview contacts"
    - "Template dropdown auto-selects based on contact's labels on load"
    - "Friendly names appear in template dropdown (not raw IDs)"
  artifacts:
    - path: "src/utils/contact-ordering.ts"
      provides: "Contact ordering utility with label-based sorting"
      min_lines: 25
      exports: ["sortContactsByLabel"]
    - path: "src/components/ContactList.tsx"
      provides: "ContactList with ordering applied"
      min_lines: 35
  key_links:
    - from: "src/components/ContactList.tsx"
      to: "src/utils/contact-ordering.ts"
      via: "import and use sortContactsByLabel"
      pattern: "sortContactsByLabel"
    - from: "src/app/messages/page.tsx"
      to: "src/utils/contact-ordering.ts"
      via: "apply ordering before passing to ContactList"
      pattern: "sortContactsByLabel"
    - from: "src/components/ContactRow.tsx"
      to: "src/utils/template-loader.ts"
      via: "use friendly names from MessageType.name"
      pattern: "messageType.name"
---

<objective>
Implement contact ordering logic (calling first, interview next, others last) and auto-select templates based on labels. Update ContactList to use ordering and ContactRow to auto-select initial templates.

Purpose: Provide intelligent defaults and organization so users see contacts in a logical order with pre-selected templates based on label matching.

Output: Contact ordering utility, ContactList with applied ordering, and ContactRow with label-based template auto-selection.
</objective>

<execution_context>
@/Users/kjc/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kjc/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/02-contact-display-template-selection/02-contact-display-template-selection-01-PLAN.md
@.planning/phases/02-contact-display-template-selection/02-contact-display-template-selection-02-PLAN.md

# Existing patterns to follow
@src/utils/transformers.ts (Ramda-style functional patterns)
@src/utils/dates.ts (utility function patterns)
</context>

<tasks>

<task type="auto">
  <name>Create contact ordering utility</name>
  <files>src/utils/contact-ordering.ts</files>
  <action>
    Create `src/utils/contact-ordering.ts` with the following:

    1. Import types:
       ```typescript
       import { Contact } from "@/types/messages";
       import { pipe, sort } from "rambdax";
       ```

    2. Define label priority map:
       ```typescript
       const LABEL_PRIORITY: Record<string, number> = {
         'calling': 1,
         'interview': 2,
       };
       ```

    3. Export `getContactLabelPriority(contact: Contact)` function:
       - For calling contacts (kind === 'calling'): return 1
       - For interview contacts (kind === 'interview'):
         - Check if label name contains 'calling' (case-insensitive): return 1
         - Check if label name contains 'interview' (case-insensitive): return 2
         - Otherwise: return 3
       - For others: return 3

    4. Export `sortContactsByLabel(contacts: Contact[])` function:
       - Uses Ramda `sort` with `getContactLabelPriority` as comparator
       - Returns sorted array where:
         - Priority 1 (calling) contacts appear first
         - Priority 2 (interview) contacts appear second
         - Priority 3 (other) contacts appear last
       - Within same priority: maintains original order (stable sort)

    Per planning_context: "contacts with 'calling' labels first, then 'interview' labels, then others (any order after that)"
  </action>
  <verify>
    Run: `node -e "
    const contacts = [
      {kind: 'calling', name: 'A', labels: {name: 'calling'}},
      {kind: 'interview', name: 'B', labels: {name: 'interview'}},
      {kind: 'interview', name: 'C', labels: {name: 'calling interview'}},
      {kind: 'interview', name: 'D', labels: {name: 'other'}}
    ];
    const sorted = require('./src/utils/contact-ordering.ts').sortContactsByLabel(contacts);
    console.log(sorted.map(c => c.name));
    "`
    Expected order: A, C, B, D (calling first, calling-interview next, interview next, other last)
  </verify>
  <done>sortContactsByLabel returns contacts ordered by priority: calling (1), calling-interview (1), interview (2), other (3)</done>
</task>

<task type="auto">
  <name>Add template auto-selection based on labels</name>
  <files>src/utils/template-loader.ts</files>
  <action>
    Update `src/utils/template-loader.ts` to add auto-selection logic:

    1. Export `autoSelectTemplate(contact: Contact, messageTypes: MessageType[])` function:
       - For calling contacts (kind === 'calling'):
         - Match to template with id === 'calling-acceptance'
         - If not found, return undefined
       - For interview contacts (kind === 'interview'):
         - Get label name from contact.labels?.name
         - Check for partial matches against messageTypes:
           - 'temple' label → 'temple-visit' template
           - 'welfare' label → 'welfare-meeting' template
           - 'family' label → 'family-council' template
           - 'bishop' in label → 'bishop-interview' template
           - 'first counselor' in label → 'first-counselor-interview' template
           - 'second counselor' in label → 'second-counselor-interview' template
           - Default → 'interview-reminder' template
         - Case-insensitive matching
         - Return template.id or undefined if no match

    2. The function should be used by ContactRow to set initialTemplateId prop.

    Per planning_context: "1:1 label-to-template matching: a card with label 'temple recommend interview' matches 'temple recommend renewal' template"
    - Note: Since our template is 'temple-visit', match any label containing 'temple' to it
    - Use partial matching since exact 1:1 isn't possible with existing templates
  </action>
  <verify>
    Run: `node -e "
    const { getAvailableMessageTypes, autoSelectTemplate } = require('./src/utils/template-loader.ts');
    const messageTypes = getAvailableMessageTypes();

    // Test calling
    const calling = {kind: 'calling', name: 'Test', labels: {name: 'calling'}};
    console.log('Calling:', autoSelectTemplate(calling, messageTypes));

    // Test temple
    const temple = {kind: 'interview', name: 'Test', labels: {name: 'temple recommend interview'}};
    console.log('Temple:', autoSelectTemplate(temple, messageTypes));

    // Test bishop
    const bishop = {kind: 'interview', name: 'Test', labels: {name: 'bishop interview'}};
    console.log('Bishop:', autoSelectTemplate(bishop, messageTypes));
    "`
    Expected: 'calling-acceptance', 'temple-visit', 'bishop-interview'
  </verify>
  <done>autoSelectTemplate returns correct template IDs for calling, temple, bishop, and other label types</done>
</task>

<task type="auto">
  <name>Update ContactList to use ordering</name>
  <files>src/components/ContactList.tsx</files>
  <action>
    Update `src/components/ContactList.tsx` to apply contact ordering:

    1. Import ordering utility:
       ```typescript
       import { sortContactsByLabel } from "@/utils/contact-ordering";
       ```

    2. In component, sort contacts before rendering:
       ```typescript
       const sortedContacts = sortContactsByLabel(contacts);
       ```

    3. Render sortedContacts instead of contacts in the map function.

    4. Pass auto-selected template ID to ContactRow:
       ```typescript
       import { autoSelectTemplate, getAvailableMessageTypes } from "@/utils/template-loader";

       const messageTypes = getAvailableMessageTypes();

       // Inside map:
       const initialTemplateId = autoSelectTemplate(contact, messageTypes);
       <ContactRow key={contact.id} contact={contact} initialTemplateId={initialTemplateId} />
       ```

    This ensures contacts appear in the correct order and have pre-selected templates.
  </action>
  <verify>
    1. Start dev server: `npm run dev`
    2. Visit `http://localhost:3000/messages`
    3. Verify contacts are ordered: calling first, interview next, others last
    4. Verify calling contacts have 'calling-acceptance' template selected
    5. Verify temple contacts have 'temple-visit' template selected
    6. Verify bishop contacts have 'bishop-interview' template selected
  </verify>
  <done>Contacts ordered correctly by label priority and have auto-selected templates based on their labels</done>
</task>

<task type="auto">
  <name>Update page to use ordering and pass message types</name>
  <files>src/app/messages/page.tsx</files>
  <action>
    Update `src/app/messages/page.tsx` to integrate ordering and message types:

    1. Instead of directly passing contacts to ContactList, apply ordering first:
       ```typescript
       import { sortContactsByLabel } from "@/utils/contact-ordering";

       const sortedContacts = sortContactsByLabel(contacts);
       ```

    2. Pass sortedContacts to ContactList:
       ```typescript
       <ContactList contacts={sortedContacts} />
       ```

    3. Remove any placeholder contact rendering (if still present from Plan 01).

    This ensures ordering is applied at the server component level before hydration.
  </action>
  <verify>
    1. Clear browser cache and reload `http://localhost:3000/messages`
    2. Verify contacts appear in correct order on initial load
    3. Verify no FOUC (flash of unstyled content) - ordering applied server-side
  </verify>
  <done>Page passes sorted contacts to ContactList and renders correctly ordered on initial load</done>
</task>

</tasks>

<verification>
After completing all tasks:
1. Navigate to /messages page
2. Verify contacts appear in order: calling labels first, interview labels next, others last
3. Verify calling contacts have "calling-acceptance" template auto-selected
4. Verify temple-related contacts have "temple-visit" template auto-selected
5. Verify bishop-related contacts have "bishop-interview" template auto-selected
6. Verify other interview contacts have "interview-reminder" as default
7. Verify dropdown shows friendly names (e.g., "Bishop Interview" not "bishop-interview")
</verification>

<success_criteria>
- Contacts sorted by label priority (calling first, interview next, others last)
- Template auto-selection works based on contact labels
- Friendly names display in template dropdown
- Ordering persists across page refresh
</success_criteria>

<output>
After completion, create `.planning/phases/02-contact-display-template-selection/02-contact-display-template-selection-03-SUMMARY.md`
</output>

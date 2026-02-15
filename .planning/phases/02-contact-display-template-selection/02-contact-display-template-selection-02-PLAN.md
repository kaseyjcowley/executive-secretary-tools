---
phase: 02-contact-display-template-selection
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/ContactRow.tsx
  - src/components/ContactList.tsx
autonomous: true

must_haves:
  truths:
    - "ContactRow displays name, labels, and phone in a compact row"
    - "ContactRow has a dropdown for selecting message templates"
    - "ContactRow displays template preview with variables substituted"
    - "Template preview updates when dropdown selection changes"
    - "ContactList renders ContactRow for each contact"
  artifacts:
    - path: "src/components/ContactRow.tsx"
      provides: "Individual contact row with template selection and preview"
      min_lines: 60
      exports: ["ContactRow"]
    - path: "src/components/ContactList.tsx"
      provides: "Contact list container component"
      min_lines: 30
      exports: ["ContactList"]
  key_links:
    - from: "src/components/ContactRow.tsx"
      to: "src/utils/template-loader.ts"
      via: "import getAvailableMessageTypes, loadTemplateContent"
      pattern: "getAvailableMessageTypes|loadTemplateContent"
    - from: "src/components/ContactRow.tsx"
      to: "src/utils/templates.ts"
      via: "import substituteTemplate"
      pattern: "substituteTemplate"
    - from: "src/components/ContactList.tsx"
      to: "src/components/ContactRow.tsx"
      via: "render ContactRow for each contact"
      pattern: "<ContactRow"
    - from: "src/app/messages/page.tsx"
      to: "src/components/ContactList.tsx"
      via: "import and render ContactList"
      pattern: "<ContactList"
---

<objective>
Build ContactRow component with per-contact template dropdown and live template preview, plus ContactList container component. This enables users to see what each message will look like with the selected contact's data substituted into the template.

Purpose: Provide template selection and preview functionality at the individual contact level, allowing users to verify message content before proceeding to the approval workflow.

Output: Interactive contact row component with template dropdown and substitution preview, plus list container.
</objective>

<execution_context>
@/Users/kjc/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kjc/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/02-contact-display-template-selection/02-contact-display-template-selection-01-PLAN.md

# Existing patterns to follow
@src/components/InterviewRow.tsx (row component pattern)
@src/components/InterviewsTable.tsx (list container pattern)
@src/utils/templates.ts (substituteTemplate usage)
</context>

<tasks>

<task type="auto">
  <name>Create ContactRow component with template dropdown and preview</name>
  <files>src/components/ContactRow.tsx</files>
  <action>
    Create `src/components/ContactRow.tsx` as a client component (`"use client"`) with the following:

    1. Import types and utilities:
       ```typescript
       import { useState } from "react";
       import { Contact, TemplateVariables } from "@/types/messages";
       import { getAvailableMessageTypes, loadTemplateContent } from "@/utils/template-loader";
       import { substituteTemplate } from "@/utils/templates";
       ```

    2. Define Props interface:
       ```typescript
       interface Props {
         contact: Contact;
         initialTemplateId?: string;
       }
       ```

    3. Component state:
       ```typescript
       const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
       const messageTypes = getAvailableMessageTypes();
       ```

    4. Compute template preview:
       ```typescript
       const templatePreview = selectedTemplateId
         ? substituteTemplate(
             loadTemplateContent(selectedTemplateId),
             {
               name: contact.name,
               phone: contact.phone,
               appointmentType: contact.kind === 'calling' ? contact.calling : contact.labels?.name,
             } as TemplateVariables
           )
         : '';
       ```

    5. Render with Tailwind classes (compact list row pattern):
       - Container: `<div className="border border-slate-300 p-4 space-y-3">`
       - Contact info section (flex row):
         - Name: `<span className="font-semibold text-slate-900">{contact.name}</span>`
         - Labels (if exist): `<span className="ml-2 text-sm text-slate-600">{contact.labels?.name}</span>`
         - Phone (if exists): `<span className="ml-4 text-sm text-slate-600">{contact.phone}</span>`
       - Template dropdown:
         - `<select className="w-full md:w-64 p-2 border border-slate-300 rounded text-slate-900"`
         - Options: "Select message type" (disabled), then all messageTypes grouped by category
         - onChange: `setSelectedTemplateId(e.target.value)`
         - value: selectedTemplateId
       - Template preview section:
         - `<div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap text-sm">`
         - Content: templatePreview or empty message if no template selected
         - Partial substitution: leave variables as {{variable}} if data not available

    6. Group dropdown options by category (calling, interview, temple, welfare, family, follow-up) with optgroup elements for UX.

    Key styling decisions (per planning_context):
    - Compact row layout (full width)
    - Fixed height (not expandable)
    - Template preview always visible (no toggle)
    - Full text display (no truncation)
  </action>
  <verify>
    1. Start dev server: `npm run dev`
    2. Visit `http://localhost:3000/messages` (after Plan 01 completes)
    3. For any contact row:
       - Verify name, label, phone are visible
       - Verify dropdown shows all message types grouped by category
       - Select a template from dropdown
       - Verify preview shows template with {{name}} replaced with contact's name
       - Verify {{phone}} is replaced if phone exists, or shows {{phone}} if missing
    4. Change template selection: Verify preview updates
  </verify>
  <done>ContactRow displays contact info, template dropdown with grouped options, and live template preview with variable substitution</done>
</task>

<task type="auto">
  <name>Create ContactList container component</name>
  <files>src/components/ContactList.tsx</files>
  <action>
    Create `src/components/ContactList.tsx` as a client component (`"use client"`) with the following:

    1. Import types and components:
       ```typescript
       import { Contact } from "@/types/messages";
       import { ContactRow } from "./ContactRow";
       ```

    2. Define Props interface:
       ```typescript
       interface Props {
         contacts: Contact[];
       }
       ```

    3. Render contacts list:
       - Container: `<div className="space-y-2">`
       - Map over contacts array
       - Render `<ContactRow key={contact.id} contact={contact} />` for each contact
       - Handle empty array: show "No contacts to display" message in italic text

    4. Styling: Use Tailwind classes matching existing patterns (InterviewsTable uses space-y-8, this uses space-y-2 for compact rows)

    This component simply iterates and renders ContactRow components. The ordering logic will be added in Plan 03.
  </action>
  <verify>
    1. Visit `http://localhost:3000/messages` (after Plan 01 completes)
    2. Verify all contacts are displayed as ContactRow components
    3. Verify contacts are in a vertical list with spacing
    4. With 0 contacts: Verify "No contacts to display" message appears
  </verify>
  <done>ContactList renders ContactRow for each contact with proper spacing and empty state handling</done>
</task>

</tasks>

<verification>
After completing all tasks:
1. Navigate to /messages page
2. Verify each contact row displays name, labels, and phone
3. Verify template dropdown shows all options grouped by category
4. Verify selecting a template shows preview with substituted variables
5. Verify preview updates when template selection changes
6. Verify missing variables remain as {{variable}} placeholders
</verification>

<success_criteria>
- ContactRow component displays contact info and template dropdown
- Template preview shows with variable substitution
- Preview updates when dropdown selection changes
- ContactList renders all contacts as ContactRow components
- Dropdown options grouped by category for better UX
</success_criteria>

<output>
After completion, create `.planning/phases/02-contact-display-template-selection/02-contact-display-template-selection-02-SUMMARY.md`
</output>

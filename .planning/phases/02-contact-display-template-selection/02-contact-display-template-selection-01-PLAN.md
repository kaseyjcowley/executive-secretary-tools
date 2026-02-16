---
phase: 02-contact-display-template-selection
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/messages/page.tsx
  - src/utils/template-loader.ts
  - src/types/messages.ts
autonomous: true

must_haves:
  truths:
    - "User can navigate to /messages page and see contact list"
    - "Contact list displays all contacts from /api/contacts"
    - "Contact rows show name, labels, and phone number (placeholder if not available)"
    - "Loading state displays while fetching contacts"
    - "Empty state displays when no contacts exist"
  artifacts:
    - path: "src/app/messages/page.tsx"
      provides: "Contact list page with data fetching"
      min_lines: 40
      exports: ["default"]
    - path: "src/utils/template-loader.ts"
      provides: "Template metadata and loading utilities"
      min_lines: 30
    - path: "src/types/messages.ts"
      provides: "Message type definitions for templates"
      contains: "MessageType"
  key_links:
    - from: "src/app/messages/page.tsx"
      to: "/api/contacts"
      via: "fetch on server component render"
      pattern: "fetch.*api/contacts"
    - from: "src/app/messages/page.tsx"
      to: "src/utils/template-loader.ts"
      via: "import and use getAvailableMessageTypes"
      pattern: "getAvailableMessageTypes"

---

<objective>
Create contact list page at `/messages` that displays all Trello contacts with their names and labels. Page fetches contact data from `/api/contacts` and renders a responsive list view using existing Tailwind patterns.

Purpose: Provide foundation UI for appointment messaging workflow where users can browse contacts before selecting templates and generating messages.

Output: Server-rendered page component with contact list display, loading states, and template metadata utilities.
</objective>

<execution_context>
@/Users/kjc/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kjc/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/01-foundation/01-foundation-01-SUMMARY.md
@.planning/phases/01-foundation/01-foundation-02-SUMMARY.md
@.planning/phases/01-foundation/01-foundation-03-SUMMARY.md

# Existing patterns to follow
@src/app/interviews/page.tsx (server component data fetching pattern)
@src/components/InterviewsTable.tsx (table-based list view)
@src/utils/templates.ts (template loading utilities)
</context>

<tasks>

<task type="auto">
  <name>Create template loader utility with metadata</name>
  <files>src/utils/template-loader.ts</files>
  <action>
    Create `src/utils/template-loader.ts` with the following:

    1. Export `MessageType` interface:
       ```typescript
       export interface MessageType {
         id: string;
         name: string;
         category: "calling" | "interview" | "temple" | "welfare" | "family" | "follow-up";
         templatePath: string;
       }
       ```

    2. Export `getAvailableMessageTypes()` function that:
       - Reads all .txt files from `src/templates/messages/`
       - Maps each file to a MessageType with:
         - id: filename without .txt extension
         - name: derived from id (capitalize words, replace hyphens with spaces)
         - category: determined by keywords in id (calling->calling, interview->interview, temple->temple, welfare->welfare, family->family, follow->follow-up)
         - templatePath: relative path to template file
       - Returns MessageType[] sorted by category then name

    3. Export `loadTemplateContent(id: string)` that:
       - Uses existing `loadTemplate` from `src/utils/templates.ts`
       - Returns template content as string

    This utility will be used by both the contact list page (for dropdown options) and the contact row component (for template loading).
  </action>
  <verify>
    Run: `node -e "console.log(require('./src/utils/template-loader.ts').getAvailableMessageTypes())"`
    Expected: Array of MessageType objects with id, name, category, templatePath for all 10 templates
  </verify>
  <done>getAvailableMessageTypes() returns 10 MessageType objects with correct categories (calling: 2, interview: 4, temple: 1, welfare: 1, family: 1, follow-up: 1)</done>
</task>

<task type="auto">
  <name>Create contact list page with data fetching</name>
  <files>src/app/messages/page.tsx</files>
  <action>
    Create `src/app/messages/page.tsx` as a server component with the following:

    1. Fetch contacts from `/api/contacts` endpoint:
       ```typescript
       const contactsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/contacts`, {
         cache: 'no-store'
       });
       const { contacts } = await contactsResponse.json();
       ```

    2. Render a main container using Tailwind classes (follow interviews page pattern):
       ```tsx
       <main className="p-2 md:p-24 flex flex-col space-y-10">
         <h1 className="text-3xl font-bold leading-none tracking-tight text-gray-900">
           Appointment Messages
         </h1>
         {/* Contact list here */}
       </main>
       ```

    3. Handle loading state: Use Suspense with a fallback showing "Loading contacts..."
    4. Handle empty state: When contacts array is empty, show "No contacts found" message
    5. Create a placeholder `<ContactList />` component reference (will be implemented in Plan 02)
    6. For now, render a simple list of contacts with:
       - Each contact in a div with border and padding
       - Display contact.name
       - Display contact.labels?.name if exists
       - Display phone number placeholder (e.g., "---" or "(no phone)") since phone data not available from /api/contacts
       - Use Tailwind classes for styling (follow interviews pattern: border, padding, odd/even background)

    The full ContactList and ContactRow components will be implemented in Plan 02 with proper phone number display handling.
  </action>
  <verify>
    1. Start dev server: `npm run dev`
    2. Visit `http://localhost:3000/messages`
    Expected: Page loads with title "Appointment Messages", shows contacts from configured lists
    3. Test with no contacts (empty list IDs): Shows "No contacts found"
    4. Test loading state (slow network): Shows loading fallback
  </verify>
  <done>Page at /messages loads and displays contacts from /api/contacts with name and labels visible for each contact</done>
</task>

<task type="auto">
  <name>Create message type definitions</name>
  <files>src/types/messages.ts</files>
  <action>
    Create `src/types/messages.ts` with:

    1. Import card types:
       ```typescript
       import { InterviewTrelloCard, CallingTrelloCard } from "@/requests/cards/types";
       ```

    2. Export Contact type union:
       ```typescript
       export type Contact = InterviewTrelloCard | CallingTrelloCard;
       ```

    3. Export ContactState interface for form state (will be used in Plan 02):
       ```typescript
       export interface ContactState {
         contact: Contact;
         selectedTemplate?: string;
         messagePreview?: string;
       }
       ```

    4. Export TemplateVariables interface for substitution:
       ```typescript
       export interface TemplateVariables {
         name: string;
         phone?: string;
         appointmentType?: string;
         date?: string;
         time?: string;
         location?: string;
       }
       ```

    This centralizes message-related types for the entire feature. Phone is optional in TemplateVariables since it will be populated dynamically via IndexedDB fuzzy matching.
  </action>
  <verify>
    Run: `npx tsc --noEmit`
    Expected: No type errors related to Contact, ContactState, or TemplateVariables
  </verify>
  <done>Types compile without errors and provide Contact, ContactState, TemplateVariables interfaces</done>
</task>

</tasks>

<verification>
After completing all tasks:
1. Navigate to /messages page
2. Verify all contacts from configured Trello lists are displayed
3. Verify each contact shows name, label (if available), and phone number placeholder
4. Verify loading state displays during fetch
5. Verify empty state displays when no contacts configured
</verification>

<success_criteria>
- Page at `/messages` loads and displays contacts from `/api/contacts`
- Each contact row displays name, labels, and phone number (placeholder when unavailable)
- Loading and empty states are handled appropriately
- Template metadata utility returns all 10 available message types with correct categories
</success_criteria>

<output>
After completion, create `.planning/phases/02-contact-display-template-selection/02-contact-display-template-selection-01-SUMMARY.md`
</output>

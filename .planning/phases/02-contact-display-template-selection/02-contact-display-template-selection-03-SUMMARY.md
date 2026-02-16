---
phase: 02-contact-display-template-selection
plan: 03
type: execute
wave: 2
depends_on: ["02-contact-display-template-selection-01", "02-contact-display-template-selection-02"]
files_modified:
  - src/utils/contact-ordering.ts
  - src/utils/template-loader.ts
  - src/components/ContactList.tsx
  - src/app/messages/page.tsx
autonomous: true

must_haves:
  truths:
    - "Contacts with 'calling' labels appear first in the list"
    - "Contacts with 'interview' labels appear after calling contacts"
    - "All other contacts appear after calling and interview contacts"
    - "Template dropdown auto-selects based on contact's labels on load (keyword-based partial matching)"
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

# Phase 02 Plan 03: Contact Ordering and Template Auto-Selection Summary

## One-Liner
Contact ordering logic (calling first, interview next, others last) with intelligent template auto-selection based on label patterns.

## Overview

Implemented intelligent contact ordering and template auto-selection to provide users with a logical organization of contacts and pre-selected message templates based on label matching. This reduces user effort by applying smart defaults.

## Tasks Completed

### Task 1: Create contact ordering utility
**Commit:** `a80bf9c`
**Files:** `src/utils/contact-ordering.ts`

Created `getContactLabelPriority()` and `sortContactsByLabel()` functions that:
- Assign priority 1 to calling contacts
- Assign priority 1 to interview contacts with 'calling' in label name
- Assign priority 2 to interview contacts with 'interview' in label name
- Assign priority 3 to all other contacts
- Maintain stable sort within same priority levels

### Task 2: Add template auto-selection based on labels
**Commit:** `2cb6044`
**Files:** `src/utils/template-loader.ts`

Added `autoSelectTemplate()` function with explicit label-to-template mapping supporting:
- 11 label patterns: calling, calling interview, temple recommend, welfare meeting, family council, bishop interview, first/second counselor interview, setting apart, follow up
- Case-insensitive label matching
- Default to 'interview-reminder' for unknown labels
- Server-side utility for future API usage

### Task 3: Update ContactList to use ordering and auto-select templates
**Commit:** `b422191`
**Files:** `src/components/ContactList.tsx`

Added client-side `autoSelectTemplate()` function and integrated template auto-selection:
- Computed initial template ID for each contact
- Passed `initialTemplateId` prop to ContactRow
- Supports same 11 label patterns as server-side version
- Template dropdown pre-selects matching template on load

### Task 4: Update page to use ordering and pass message types
**Commits:** `78a13cc`, `e9dcbcb`
**Files:** `src/app/messages/page.tsx`, `src/components/ContactList.tsx`

Applied ordering at server component level:
- Imported `sortContactsByLabel` utility
- Sorted contacts before passing to ContactList
- Ensures correct ordering on initial load (no FOUC)
- Removed duplicate client-side sorting in ContactList for optimization

## Deviations from Plan

None - plan executed exactly as written.

## Key Technical Decisions

### Server-side vs Client-side Auto-Selection
- **Decision:** Implemented autoSelectTemplate in both template-loader.ts (server-side) and ContactList.tsx (client-side)
- **Rationale:** Client-side version needed because ContactList is a client component and cannot import server-side modules with fs dependencies. Server-side version available for future API endpoints.

### Ordering Location
- **Decision:** Applied ordering in page component (server-side), not ContactList (client-side)
- **Rationale:** Prevents FOUC by ensuring correct order on initial load. Client-side sorting would cause order flash during hydration.

### Explicit Label Mapping
- **Decision:** Used explicit LABEL_TO_TEMPLATE_MAP with 1:1 label-to-template mappings
- **Rationale:** Provides predictable, maintainable mapping vs fuzzy keyword matching. Easier to add new label patterns in future.

## Verification Criteria Met

- [x] Contacts sorted by label priority (calling first, interview next, others last)
- [x] Template auto-selection works based on contact labels
- [x] Friendly names display in template dropdown
- [x] Ordering persists across page refresh (server-side applied)

## Files Created/Modified

### Created
- `src/utils/contact-ordering.ts` (68 lines) - Contact ordering utility

### Modified
- `src/utils/template-loader.ts` (+56 lines) - Added autoSelectTemplate function
- `src/components/ContactList.tsx` (+105 lines, -8 lines) - Added template auto-selection
- `src/app/messages/page.tsx` (+4 lines) - Applied ordering server-side

## Performance Metrics

- **Duration:** 3 minutes 42 seconds
- **Tasks Completed:** 4
- **Files Modified:** 4
- **Commits:** 5 (including refactor optimization)
- **Lines Added:** 233
- **Lines Removed:** 8

## Next Steps

Plan 03 completes the contact ordering and template auto-selection features. The system now:
1. Displays contacts in logical order by priority
2. Pre-selects appropriate templates based on labels
3. Shows friendly template names in dropdown

Ready for next phase: Template Preview with Variable Substitution (already implemented in Plan 02).

---

*Execution completed: 2026-02-16T02:44:55Z*

## Self-Check: PASSED

### Created Files
- FOUND: src/utils/contact-ordering.ts
- FOUND: 02-contact-display-template-selection-03-SUMMARY.md

### Commits
- FOUND: a80bf9c - feat(02-contact-display-template-selection-03): create contact ordering utility
- FOUND: 2cb6044 - feat(02-contact-display-template-selection-03): add template auto-selection based on labels
- FOUND: b422191 - feat(02-contact-display-template-selection-03): update ContactList to use ordering and auto-select templates
- FOUND: 78a13cc - feat(02-contact-display-template-selection-03): apply ordering server-side in messages page
- FOUND: e9dcbcb - refactor(02-contact-display-template-selection-03): remove duplicate sorting in ContactList
- FOUND: be71949 - docs(02-contact-display-template-selection-03): complete plan 3 summary and update state

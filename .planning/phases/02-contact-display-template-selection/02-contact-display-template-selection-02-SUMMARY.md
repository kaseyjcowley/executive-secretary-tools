---
phase: 02-contact-display-template-selection
plan: 02
subsystem: ui
tags: [react, nextjs, tailwind, client-components, template-substitution]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: template system, Trello contact fetcher, template loader utility
provides:
  - ContactRow component with per-contact template dropdown and live preview
  - ContactList container component rendering ContactRow for each contact
  - message-types API endpoint for client-side template fetching
  - Client-server separation pattern for template handling
affects: [02-contact-display-template-selection-03, approval-workflow]

# Tech tracking
tech-stack:
  added: [rambdax/interpolate, client-side API fetching pattern]
  patterns: [client-server separation, API-driven client components, compact list row pattern]

key-files:
  created:
    - src/components/ContactRow.tsx
    - src/components/ContactList.tsx
    - src/app/api/message-types/route.ts
    - src/utils/template-substitution.ts
  modified:
    - src/utils/templates.ts
    - src/types/messages.ts
    - src/app/messages/page.tsx

key-decisions:
  - "API-driven template loading: Client components fetch templates from server endpoint instead of importing fs-dependent modules"
  - "Client-server separation: Split template-substitution.ts for client use, keep templates.ts server-only"
  - "Index signature on TemplateVariables: Added for type compatibility with rambdax/interpolate"

patterns-established:
  - "Pattern 1: Client components fetch server data via API endpoints (no direct fs access)"
  - "Pattern 2: Compact list row with full-width content, no toggle state for preview"
  - "Pattern 3: Template dropdown grouped by category using optgroup elements"

# Metrics
duration: 4m 10s
completed: 2026-02-16
---

# Phase 02: Contact Display & Template Selection Plan 2 Summary

**ContactRow component with per-contact template dropdown and live variable-substituted preview, plus ContactList container**

## Performance

- **Duration:** 4 min 10 sec
- **Started:** 2026-02-16T02:34:32Z
- **Completed:** 2026-02-16T02:38:42Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Created ContactRow client component with template dropdown grouped by category (calling, interview, temple, welfare, family, follow-up)
- Implemented live template preview with variable substitution ({{name}}, {{appointmentType}}) using rambdax/interpolate
- Built ContactList container component that fetches message types from API and renders ContactRow for each contact
- Separated client and server code: Created template-substitution.ts for client-side use, message-types API endpoint for server-side template loading
- Updated messages page to use new ContactList component instead of inline implementation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ContactRow component with template dropdown and preview** - `5d48344` (feat)
2. **Task 2: Create ContactList container component** - `50d47b3` (feat)

**Auto-fix commit:** `7da8a85` (fix) - Client/server separation for template handling

## Files Created/Modified

### Created
- `src/components/ContactRow.tsx` - Client component displaying contact info, template dropdown, and live preview
- `src/components/ContactList.tsx` - Container component fetching message types and rendering ContactRow for each contact
- `src/app/api/message-types/route.ts` - API endpoint returning all message types with template content
- `src/utils/template-substitution.ts` - Client-side template variable substitution using rambdax/interpolate

### Modified
- `src/utils/templates.ts` - Removed substituteTemplate function to keep server-only
- `src/types/messages.ts` - Added index signature to TemplateVariables for type compatibility
- `src/app/messages/page.tsx` - Replaced inline ContactList with imported component

## Decisions Made

- **API-driven template loading:** Client components fetch templates from server endpoint instead of importing fs-dependent modules. This prevents Next.js errors when client code tries to use Node.js filesystem APIs.

- **Client-server separation:** Split template-substitution.ts for client use (contains substituteTemplate), keep templates.ts server-only (contains loadTemplate). This maintains clear separation of concerns.

- **Index signature on TemplateVariables:** Added `[key: string]: unknown` to satisfy rambdax/interpolate type requirements. Allows any template variables to be substituted without TypeScript errors.

- **Template dropdown grouping:** Used optgroup elements to organize message types by category for better UX. Categories: calling, interview, temple, welfare, family, follow-up.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed client/server module import error**
- **Found during:** Task 1 (ContactRow component creation)
- **Issue:** ContactRow imported getAvailableMessageTypes and loadTemplateContent from template-loader.ts, which uses Node.js fs module. Next.js threw "Module not found: Can't resolve 'fs'" when building client components.
- **Fix:** Created message-types API endpoint (src/app/api/message-types/route.ts) to fetch templates from server, updated ContactList to fetch message types on mount, passed messageTypes to ContactRow as prop.
- **Files modified:** src/components/ContactRow.tsx, src/components/ContactList.tsx, src/app/api/message-types/route.ts, src/utils/template-substitution.ts, src/utils/templates.ts
- **Verification:** Dev server starts without errors, page renders successfully, API returns message types with content
- **Committed in:** `7da8a85` (auto-fix commit)

**2. [Rule 1 - Bug] Fixed TypeScript type compatibility error**
- **Found during:** Task 1 (ContactRow component creation)
- **Issue:** TemplateVariables interface didn't have index signature, causing TypeScript error: "Argument of type 'TemplateVariables' is not assignable to parameter of type 'Record<string, unknown>'. Index signature for type 'string' is missing in type 'TemplateVariables'."
- **Fix:** Added `[key: string]: unknown` to TemplateVariables interface to satisfy rambdax/interpolate type requirements.
- **Files modified:** src/types/messages.ts
- **Verification:** TypeScript compilation succeeds with no errors
- **Committed in:** `5d48344` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug fixes)
**Impact on plan:** Both auto-fixes essential for correctness. No scope creep - implemented planned functionality with necessary architectural adjustments for Next.js client/server separation.

## Issues Encountered

- Next.js client/server boundary: Client components cannot directly import modules using Node.js fs. Resolved by creating API endpoint pattern for server data.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ContactRow and ContactList components complete and working
- Template preview with variable substitution functional
- Message types API endpoint operational
- Ready for Plan 03: Template Preview with Variable Substitution (additional features, ordering logic)

**Note:** Plan 03 title in phase overview appears to duplicate this plan's functionality. This plan successfully implemented template preview with variable substitution. Plan 03 may need scope adjustment to focus on ordering logic or additional features.

## Self-Check: PASSED

- ✓ src/components/ContactRow.tsx created
- ✓ src/components/ContactList.tsx created
- ✓ src/app/api/message-types/route.ts created
- ✓ src/utils/template-substitution.ts created
- ✓ SUMMARY.md created
- ✓ Commit 5d48344 exists
- ✓ Commit 50d47b3 exists
- ✓ Commit 7da8a85 exists

---
*Phase: 02-contact-display-template-selection*
*Plan: 02*
*Completed: 2026-02-16*

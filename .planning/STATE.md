# State — Automated Appointment Messaging System

## Project Status

**Initialized:** 2026-02-13
**Current Milestone:** v1 — Appointment Messaging System
**Current Phase:** 02
**Current Plan:** Not started
**Next Action:** Execute Phase 03 or create new phase plans

## Context Summary

This is a brownfield project adding an automated appointment messaging system to an existing Next.js church secretary app.

**Problem:** Weekly appointment reminders are sent manually via SMS from phone. The user wants to streamline this by:
- Reading contacts from Trello lists
- Pre-filling personalized messages from templates
- Reviewing/approving messages before sending
- Generating clickable links to send from Android phone

**v1 Scope:**
- Trello integration (read contacts, manual message type selection)
- Template system (text files with variable substitution, no CMS UI)
- Scheduling (manual before/after church assignment, slot tracking)
- Review workflow (phone verification, individual approval, message editing)
- SMS generation (clickable links for Android, not Twilio in v1)

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Manual message type selection | Auto-matching via labels is nice but not essential for v1 |
| Text file templates (no CMS) | Simpler, filesystem-based, can edit templates in code |
| Before/after church manual assignment | Complex judgment involved (meetings, families, preferences) |
| Android SMS links instead of Twilio | Clickable link opens phone app pre-filled, simpler for v1 |
| Individual approval workflow | User needs to verify phone numbers, template selection, scheduling |
| ~10 message templates | Scope based on user's current messaging needs |
| Phone verification needed | User wants to catch incorrect phone numbers before sending |
| Template categories from filename keywords | Simpler than metadata files, automatic category detection (calling, interview, temple, welfare, family, follow-up) |
| API-driven template loading for client components | Client components cannot import fs-dependent modules, fetch from API endpoint instead |
| Explicit label-to-template mapping | Provides predictable, maintainable mapping vs fuzzy keyword matching for auto-selection |
| Server-side ordering in page component | Prevents FOUC by ensuring correct order on initial load, avoids duplicate client-side sorting |

## Codebase Context

**Existing Assets:**
- Trello API integration (authenticated, fetches cards/members from specific boards)
- Functional data transformation pipeline using Ramda
- API routes in `src/app/api/` for external integrations
- React components with Tailwind CSS styling
- Environment-based authentication patterns
- Redis configured for caching

**Relevant Existing Code:**
- `src/requests/cards/` — Trello card fetching
- `src/app/api/` — API route patterns
- External integrations (Slack, Gmail) for reference

## Open Questions / TBD

| Question | Impact | Notes |
|----------|--------|-------|
| Which Trello lists to read? | Required | User will specify list IDs during Phase 1 |
| Phone number location in Trello? | Resolved | Parse from description using "Phone: number" pattern |
| Template variables needed? | Required | name, phone, appointmentType, date, time, location? |
| Time picker format? | UI/UX | Dropdown? Custom input? |
| Duration options? | UI/UX | 15min, 30min, 1hr, custom? |
| Before/after church representation? | UI/UX | How to show in UI? |
| Slot tracking storage? | Technical | Redis? In-memory? File-based? |

## Configuration

**Mode:** Interactive (confirm at each step)
**Depth:** Standard (5-8 phases, 3-5 plans each)
**Execution:** Sequential (one plan at a time)
**Git Tracking:** Yes (planning docs tracked)
**Workflow Agents:**
- Research: Yes (before planning each phase)
- Plan Check: Yes (verify plans before execution)
- Verifier: Yes (verify work after each phase)

**Model Profile:** Balanced (Sonnet for planning agents)

## Files Created

- `.planning/PROJECT.md` — Project context, requirements, constraints
- `.planning/config.json` — Workflow configuration
- `.planning/REQUIREMENTS.md` — Scoped v1 requirements
- `.planning/ROADMAP.md` — 7-phase roadmap with plans per phase
- `.planning/phases/01-foundation/01-foundation-01-SUMMARY.md` — Template system completion summary
- `.planning/phases/01-foundation/01-foundation-02-SUMMARY.md` — Trello contact fetcher summary
- `.planning/phases/01-foundation/01-foundation-03-SUMMARY.md` — Trello configuration API summary
- `.planning/phases/01-foundation/01-foundation-VERIFICATION.md` — Phase 1 verification report (8/8 passed)
- `.planning/phases/02-contact-display-template-selection/02-contact-display-template-selection-01-SUMMARY.md` — Contact list page completion summary
- `.planning/phases/02-contact-display-template-selection/02-contact-display-template-selection-02-SUMMARY.md` — Contact list component with template selection summary
- `.planning/phases/02-contact-display-template-selection/02-contact-display-template-selection-03-SUMMARY.md` — Contact ordering and template auto-selection summary

## Commits

| Hash | Message |
|------|---------|
| e1e4c8f | feat(01-foundation-03): add contacts API route |
| e18588c | feat(01-foundation-03): add configurable appointment list IDs |
| a9ef810 | feat(01-foundation-02): create buildContactCard transformer |
| a9e87fb | feat(01-foundation-02): add fetchContactCards function |
| 48cecd4 | feat(01-foundation-02): add ContactCard type with phone field |
| dcee83b | feat(01-foundation-01): create sample message templates |
| df08449 | feat(01-foundation-01): create template loader utility |
| 5bfec52 | docs(01-foundation): create phase plan with 3 plans in 2 waves |
| 7072121 | docs(01-foundation): research phase 1 foundation - template system and Trello integration |
| 57d7cf7 | docs: add project state memory |
| 3421a5c | docs: create roadmap with 7 phases |
| 076b3ea | docs: add project state memory |
| e243507 | chore: add project config |
| 255d54a | docs: initialize project - automated appointment messaging system |

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files | Date |
|-------|------|----------|-------|-------|------|
| 01-foundation | 01 | 49s | 2 | 11 | 2026-02-14 |
| 01-foundation | 02 | 5min | 3 | 3 | 2026-02-15 |
| 01-foundation | 03 | 36s | 2 | 2 | 2026-02-15 |
| 02-contact-display-template-selection | 01 | 3m 43s | 3 | 3 | 2026-02-16 |
| 02-contact-display-template-selection | 02 | 4m 10s | 3 | 7 | 2026-02-16 |
| 02-contact-display-template-selection | 03 | 3m 42s | 4 | 4 | 2026-02-16 |

## Phase 1 Completion Summary

**Status:** Milestone complete
**Verification:** 8/8 must-haves passed (100%)

### What Was Built
1. **Template System** - `src/utils/templates.ts` with `loadTemplate()` and `substituteTemplate()` functions
2. **Message Templates** - 10 templates in `src/templates/messages/` with `{{variable}}` syntax
3. **ContactCard Type** - Extended TrelloCard with optional phone field
4. **Contact Fetcher** - `fetchContactCards()` function fetching with description/labels
5. **Phone Extraction** - `buildContactCard()` transformer using regex pattern
6. **API Endpoint** - `/api/contacts` GET endpoint with configurable list IDs

### Key Decisions
- **Description parsing over custom fields**: Simpler regex-based phone extraction from Trello card descriptions
- **Optional phone field**: Supports gradual migration of Trello cards without phone data

### What Was Built
1. **Contact Ordering Utility** - `src/utils/contact-ordering.ts` with `sortContactsByLabel()` for priority-based sorting
2. **Template Auto-Selection** - `autoSelectTemplate()` in both template-loader.ts (server) and ContactList.tsx (client)
3. **Server-Side Ordering** - Applied in page component to prevent FOUC on initial load
4. **Label Pattern Matching** - Supports 11 label patterns: calling, temple, welfare, family, bishop, counselor, setting apart, follow up

## Phase 2 Progress

**Plan 01: Contact List Page** - COMPLETE (2026-02-16)
- Created /messages page with server-rendered contact list ✓
- Built template loader utility with 10 message types across 6 categories ✓
- Established type definitions (Contact, ContactState, TemplateVariables) ✓

**Plan 02: Contact List Component with Template Selection** - COMPLETE (2026-02-16)
- Created ContactRow component with template dropdown grouped by category ✓
- Implemented live template preview with variable substitution ({{name}}, {{appointmentType}}) ✓
- Built ContactList container fetching message types from API ✓
- Separated client and server code: template-substitution.ts for client, message-types API for server ✓

**Plan 03: Contact Ordering and Template Auto-Selection** - COMPLETE (2026-02-16)
- Created contact ordering utility with label-based sorting (calling first, interview next, others last) ✓
- Implemented template auto-selection based on label patterns (11 patterns supported) ✓
- Applied ordering server-side to prevent FOUC ✓
- Pre-selected templates on load based on contact labels ✓

---

## Next Steps

Phase 02 is complete. Ready for Phase 03 or additional features.

---
*Last updated: 2026-02-16 (Plan 03 complete)*
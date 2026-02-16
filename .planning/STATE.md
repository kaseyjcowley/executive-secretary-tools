# State — Automated Appointment Messaging System

## Project Status

**Initialized:** 2026-02-13
**Current Milestone:** v1 — Appointment Messaging System
**Current Phase:** 02-contact-display-template-selection (Contact Display & Template Selection)
**Current Plan:** 02-contact-display-template-selection-01 (Contact List Page) - COMPLETED
**Next Action:** Execute Plan 02 - Contact List Component with Template Selection

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

## Phase 1 Completion Summary

**Status:** Complete (2026-02-14)
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

## Phase 2 Progress

**Plan 01: Contact List Page** - COMPLETE (2026-02-16)
- Created /messages page with server-rendered contact list ✓
- Built template loader utility with 10 message types across 6 categories ✓
- Established type definitions (Contact, ContactState, TemplateVariables) ✓

**Plan 02: Contact List Component with Template Selection** - IN PROGRESS

**Plan 03: Template Preview with Variable Substitution** - NOT STARTED

---

## Next Steps

Execute Plan 02 - Contact List Component with Template Selection:
- Extract ContactList into reusable component
- Add template selection dropdown using getAvailableMessageTypes()
- Implement template preview with variable substitution
- Add contact row component with expanded state

---
*Last updated: 2026-02-16*
# State — Automated Appointment Messaging System

## Project Status

**Initialized:** 2026-02-13
**Current Milestone:** v1 — Appointment Messaging System
**Next Action:** `/gsd:plan-phase 1` — Plan Phase 1 (Foundation)

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
| Phone number location in Trello? | Required | Parse from description or custom field? |
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

## Commits

| Hash | Message |
|------|---------|
| 255d54a | docs: initialize project - automated appointment messaging system |
| e243507 | chore: add project config |
| 3421a5c | docs: define v1 requirements |
| 57d7cf7 | docs: create roadmap with 7 phases |

## Next Steps

Run `/gsd:plan-phase 1` to create a detailed execution plan for Phase 1 (Foundation).

Phase 1 will cover:
1. Create template system with variable substitution
2. Fetch and structure Trello contact data
3. Add configuration for Trello list IDs

---
*Last updated: 2026-02-13*

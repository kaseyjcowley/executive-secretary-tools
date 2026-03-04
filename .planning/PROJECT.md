# Automated Appointment Messaging System

## What This Is

A web-based system that automates sending SMS reminders for church appointments. It reads contacts from specific Trello lists, matches them to message templates based on labels/card titles, pre-fills personalization variables from card data, and provides an approval workflow before sending SMS via Twilio.

## Core Value

Weekly appointment reminders are sent efficiently with personalized messages, while maintaining human control over scheduling and verification.

## Requirements

### Validated

- ✓ Trello API integration for fetching cards — existing
- ✓ Data transformation pipeline (functional composition with Ramda) — existing
- ✓ API routes for external service integrations — existing
- ✓ Web UI for displaying structured data — existing
- ✓ External messaging integration patterns (Slack, Gmail) — existing
- ✓ Environment-based authentication for external services — existing

### Active

- [ ] System reads specific Trello lists representing people to contact for appointments
- [ ] Labels and titles are analyzed to determine which message template to apply
- [ ] Content management system for creating/managing ~10 message templates
- [ ] Templates support variable substitution (e.g., {{name}}, {{appointmentType}}, {{time}})
- [ ] Before/after church scheduling can be assigned during approval workflow
- [ ] System suggests scheduling preferences: prefer after church, especially for families
- [ ] Review screen shows pre-filled message side-by-side with original Trello card
- [ ] Phone number verification during review (check that contact info is correct)
- [ ] Individual approval workflow (approve/edit each message one-by-one)
- [ ] Approved messages are sent via SMS service (Twilio or similar)
- [ ] Support for manual overrides of all suggestions (template selection, scheduling, message content)

### Out of Scope

- Mobile app — web-based approval workflow instead
- Automated scheduling without human input — requires manual assignment/verification
- Message analytics/tracking beyond delivery confirmation
- Bulk approval of all messages — requires individual verification
- Real-time message preview as user types — approval workflow only

## Context

This is adding to an existing Next.js application that already handles church secretary tasks. The existing codebase has:

- **Trello integration**: Currently fetches interview schedules and calling cards from specific boards/lists
- **Messaging patterns**: Integrates with Slack and Gmail for notifications
- **Data pipeline**: Uses functional composition with Ramda to transform Trello data
- **UI patterns**: Server-rendered pages with Tailwind CSS styling
- **API structure**: Route handlers in `src/app/api/` for external integrations

The new feature follows the same architectural patterns:
- API routes for Trello data fetching and SMS sending
- Data transformation in `src/requests/`
- React components in `src/components/` for approval UI
- Environment variables for service authentication

**Scheduling context**: Church appointments are scheduled in two time blocks:
1. Before church — typically less preferred by members
2. After church — preferred, especially easier for families with young children

The user manually determines which block each appointment goes into based on:
- Meeting conflicts before church (sometimes block before entirely)
- Member preference
- Family situation (young families → after church preferred)

## Constraints

- **Tech Stack**: Must use existing Next.js, TypeScript, Tailwind CSS setup
- **Deployment**: Vercel (existing deployment platform)
- **Trello**: Use existing Trello API keys and integration patterns
- **Database**: Redis already configured for caching, can be reused for message queue/tracking
- **SMS**: Must use service like Twilio (adds new API dependency)
- **User Workflow**: Weekly process, approval must be individual (no bulk approve)
- **Trello Schema**: May need to add fields for before/after church indicators (discuss during implementation)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web-based approval over mobile app | Leverages existing codebase, simpler deployment, SMS via Twilio eliminates need for phone integration | — Pending |
| Individual approval per message | User needs to verify phone numbers, template selection, and scheduling are correct | — Pending |
| Human scheduling control | Complex judgment involved (meetings, family situations, member preferences) not easily automated | — Pending |
| ~10 message templates | Scope based on user description of their current messaging needs | — Pending |
| Side-by-side Trello card comparison | User needs to verify the system interpreted the card correctly before sending | — Pending |

---
*Last updated: 2026-02-13 after initialization*

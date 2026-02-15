# Roadmap — Automated Appointment Messaging System

## Overview

A phased approach to building an appointment messaging system that reads Trello contacts, pre-fills messages, and provides an approval workflow before generating SMS links.

**Estimated Phases:** 7
**Execution Mode:** Sequential
**Planning Depth:** Standard (3-5 plans per phase)

---

## Phase 1: Foundation

**Goal:** Establish the template system and Trello data pipeline.

**Dependencies:** None

**Deliverables:**
- Template filesystem structure (`src/templates/messages/*.txt`)
- Variable substitution engine (replaces `{{variables}}` with data)
- ~10 sample message templates
- Enhanced Trello fetcher to extract contact data (name, phone, labels, title)
- Configurable list IDs for Trello boards

**Plans:**
1. Create template system with variable substitution
2. Fetch and structure Trello contact data
3. Add configuration for Trello list IDs

**Exit Criteria:**
- Templates load from filesystem
- Variables substitute correctly with test data
- Trello data fetches contact info with phone number

**Risks:**
- Phone number location in Trello unclear → Parse from description or add custom field

---

## Phase 2: Contact Display & Template Selection

**Goal:** Build UI to display contacts and select message templates.

**Dependencies:** Phase 1

**Deliverables:**
- Contact list page showing all Trello contacts
- Contact card component (name, labels, preview)
- Message type dropdown with ~10 options
- Template preview showing selected template

**Plans:**
1. Create contact list API route
2. Build contact list page with React components
3. Add message type dropdown and template preview

**Exit Criteria:**
- User can see all contacts from Trello
- Dropdown shows available message templates
- Selected template preview displays

---

## Phase 3: Message Editing & Phone Verification

**Goal:** Allow users to verify phone numbers and edit message content.

**Dependencies:** Phase 2

**Deliverables:**
- Phone number input field (pre-filled from Trello)
- Phone number validation (format check)
- Message text area with character count
- Real-time variable substitution as templates change
- Persist edits during session

**Plans:**
1. Add phone verification UI components
2. Build message editing interface
3. Implement real-time preview with substitution
4. Add character counter for SMS awareness

**Exit Criteria:**
- User can edit phone numbers with validation
- Message content updates with variable substitution
- Character count displays SMS limits

---

## Phase 4: Scheduling System

**Goal:** Build time block assignment and slot tracking.

**Dependencies:** Phase 2 (contact display)

**Deliverables:**
- Before/After church selector
- Time picker for appointment start time
- Duration selector (dropdown: 15min, 30min, custom)
- Slot tracking system (stores taken slots)
- Conflict detection (warn on overlapping appointments)
- Persistence for scheduled appointments

**Plans:**
1. Design scheduling data model (slots, appointments)
2. Build scheduling UI components
3. Implement conflict detection logic
4. Add persistence (Redis or file-based)

**Exit Criteria:**
- User can assign time blocks to contacts
- System tracks which slots are taken
- Conflicts are detected and warned

---

## Phase 5: Approval Workflow

**Goal:** Connect all components into an individual approval flow.

**Dependencies:** Phases 3, 4

**Deliverables:**
- Sequential review flow (one contact at a time)
- "Approve & Next" and "Skip" buttons
- Review summary page (all approved messages)
- Cannot proceed without required fields (message type, time block, phone)
- State persistence across review (Redis)

**Plans:**
1. Design approval workflow state machine
2. Build sequential review UI
3. Implement approval/skip logic
4. Create review summary page
5. Add validation for required fields

**Exit Criteria:**
- User reviews contacts one-by-one
- Cannot skip required fields
- Summary shows all approved messages

---

## Phase 6: SMS Link Generation

**Goal:** Generate clickable `sms:` links for Android phones.

**Dependencies:** Phase 5

**Deliverables:**
- SMS link generator (format: `sms:<phone>?body=<encoded_message>`)
- URL encoding for message body
- Display links on review summary
- "Send Messages" button reveals all links
- Copy-to-clipboard option for each link

**Plans:**
1. Implement SMS link formatting
2. Add URL encoding for message body
3. Build link display components
4. Add copy-to-clipboard functionality

**Exit Criteria:**
- Links generate correctly for each approved message
- Clicking opens phone SMS app pre-filled
- User can copy links if needed

---

## Phase 7: Polish & Testing

**Goal:** Error handling, UX improvements, and end-to-end testing.

**Dependencies:** Phase 6

**Deliverables:**
- Error handling for Trello API failures
- Loading states and empty states
- Clear success feedback
- Mobile-responsive design
- End-to-end test of full workflow
- Documentation for template editing and usage

**Plans:**
1. Add error handling and loading states
2. Improve mobile responsiveness
3. Add UX polish (success toasts, confirmations)
4. Conduct end-to-end testing
5. Write usage documentation

**Exit Criteria:**
- App handles errors gracefully
- Works well on mobile devices
- Full workflow tested and documented
- User can complete the entire process without errors

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Phone number not in Trello card | High | Parse from description or add custom field to Trello board |
| SMS link format varies by Android version | Medium | Test on user's device, fallback to copy-to-clipboard |
| Slot tracking complexity increases scope | Medium | Start with simple in-memory tracking, migrate to Redis if needed |
| Template variables unclear | Low | Document available variables, use empty string fallback |

---

## Exit Criteria (Full Milestone)

v1 is complete when:
1. User can fetch contacts from configured Trello lists
2. User can select message type, assign time block, verify phone, and edit message for each contact
3. User approves messages one-by-one through review workflow
4. Approved messages generate clickable SMS links
5. User can send messages via phone SMS app
6. Documentation exists for adding/editing templates

---

## Phases at a Glance

```
Phase 1: Foundation
  ├─ Template system (filesystem + substitution)
  └─ Trello contact data fetching

Phase 2: Contact Display
  ├─ Contact list page
  └─ Message type dropdown

Phase 3: Message Editing
  ├─ Phone verification UI
  └─ Message editing with character count

Phase 4: Scheduling
  ├─ Time block assignment
  └─ Slot tracking with conflict detection

Phase 5: Approval Workflow
  ├─ Sequential review flow
  └─ Approval summary page

Phase 6: SMS Generation
  └─ Clickable sms:// links

Phase 7: Polish & Testing
  ├─ Error handling & UX
  └─ Documentation
```

---
*Last updated: 2026-02-13*

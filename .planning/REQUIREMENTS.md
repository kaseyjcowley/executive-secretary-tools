# Requirements — Automated Appointment Messaging System (v1)

## Project Context

Adding an automated messaging system to an existing Next.js church secretary app. The system reads Trello lists for appointment contacts, pre-fills personalized messages, and provides an approval workflow before sending SMS.

**Existing Codebase Assets:**
- Trello API integration (authenticated, fetches cards/members)
- Functional data transformation pipeline (Ramda)
- API routes and React components
- Environment-based authentication patterns

## v1 Goals

Ship a functional appointment messaging system that:
- Reads Trello lists for weekly appointment contacts
- Pre-fills messages with card data
- Provides individual message approval workflow
- Generates SMS links for Android phone delivery

## v1 Requirements

### R1 — Trello Data Source

The system reads Trello lists representing people to contact for appointments.

**Acceptance Criteria:**
- [ ] System reads cards from one or more specified Trello lists
- [ ] Card data includes: name, phone number, labels, card title
- [ ] Data is fetched using existing Trello API integration patterns
- [ ] Failed fetches are handled gracefully with error messages

**Open Questions:**
- Which specific Trello lists should be read? (user to specify)
- Should we add a Trello field for phone number, or parse from card description?

**Dependencies:** None

---

### R2 — Message Type Selection

User manually selects which message template to apply to each contact.

**Acceptance Criteria:**
- [ ] Dropdown shows available message templates (~10 options)
- [ ] Selection persists during approval workflow
- [ ] Default option is "Select message type"
- [ ] Cannot proceed without selecting a message type

**Open Questions:**
- What are the ~10 message types? (to be documented with templates)

**Dependencies:** R3 (templates defined)

---

### R3 — Template System

Message templates stored as text files with variable substitution.

**Acceptance Criteria:**
- [ ] Templates stored in filesystem (e.g., `src/templates/messages/*.txt`)
- [ ] Templates support variables like `{{name}}`, `{{appointmentType}}`, `{{time}}`
- [ ] Variables are replaced with values from Trello card data
- [ ] Missing variables are replaced with empty string (no crash)
- [ ] Templates can be edited directly in code/text editor (no CMS UI in v1)

**Open Questions:**
- What template variables are needed? (name, phone, appointment type, date, time, location?)
- What's the template file format/naming convention?

**Dependencies:** None

---

### R4 — Scheduling Assignment

User assigns each appointment to a time block (before church or after church) during approval.

**Acceptance Criteria:**
- [ ] Dropdown/radio buttons to select "Before Church" or "After Church"
- [ ] System tracks which slots are already taken
- [ ] For each appointment: user specifies start time and duration
- [ ] Slot tracking prevents overlapping appointments (warn or block)
- [ ] Scheduling persists during approval workflow
- [ ] Cannot proceed without assigning time block

**Open Questions:**
- How does user specify start time? (time picker, dropdown?)
- Duration options? (15min, 30min, custom?)
- How do we represent "before church" and "after church" in the UI?

**Dependencies:** None

---

### R5 — Phone Verification

User verifies the phone number is correct before sending.

**Acceptance Criteria:**
- [ ] Phone number from Trello card is displayed prominently
- [ ] User can edit phone number if incorrect
- [ ] Edited phone number is saved with the message approval state
- [ ] Phone number validation (basic format check)

**Dependencies:** R1 (fetches phone number from Trello)

---

### R6 — Message Editing

User can edit the pre-filled message content before approval.

**Acceptance Criteria:**
- [ ] Text area shows pre-filled message with variables substituted
- [ ] User can edit message content
- [ ] Edited content is saved with approval state
- [ ] Original template is not modified
- [ ] Message character count displayed (SMS limit awareness)

**Dependencies:** R3 (templates), R2 (template selection), R1 (Trello data)

---

### R7 — Individual Approval Workflow

Each message must be approved individually.

**Acceptance Criteria:**
- [ ] Contact cards shown one at a time or in a list
- [ ] Each contact has: message type selector, scheduling, phone verification, message editing
- [ ] "Approve & Next" button to approve current message and move to next
- [ ] "Skip" button to skip a contact (not send)
- [ ] Final "Send Messages" button generates SMS links after all approvals
- [ ] User cannot send messages until all reviewed contacts are approved or skipped

**Dependencies:** R2, R4, R5, R6

---

### R8 — SMS Link Generation

Generate clickable links that open Android SMS app pre-filled.

**Acceptance Criteria:**
- [ ] Each approved message generates a `sms:` link with phone number and body
- [ ] Link format: `sms:<phone>?body=<encoded_message>`
- [ ] Links displayed for each approved message
- [ ] User can click link to open phone's SMS app
- [ ] Message is sent by user from phone (not automatic in v1)

**Dependencies:** R7 (approved messages)

---

## Out of Scope (v2+)

- Trello label/title analysis for automatic message type matching
- CMS UI for managing templates
- Side-by-side Trello card comparison during review
- Twilio integration for automatic SMS sending
- Delivery status tracking
- Message analytics
- Bulk approval workflow
- Real-time preview during editing

## Data Model (Trello Card → Message)

```
Trello Card:
├── name (person's name)
├── phone (from description or custom field)
├── labels (appointment types)
└── title (card name, may contain appointment info)

Message Template:
├── templateId (e.g., "temple-reminder", "calling-acceptance")
├── content (with {{variables}})
└── variables: name, phone, appointmentType, date, time, location

Approved Message:
├── contactId (from Trello card id)
├── templateId
├── timeBlock (before/after church)
├── startTime (when appointment starts)
├── duration (how long)
├── phone (verified/edited)
├── messageContent (edited if needed)
└── smsLink (generated link)
```

## Technical Considerations

**Data Persistence:**
- Templates: Filesystem (text files)
- Approval state: Could be in-memory during session, or Redis for durability
- Scheduling slots: Need storage (Redis or new database)

**Filesystem Templates:**
- Location: `src/templates/messages/`
- Format: Plain text with `{{variable}}` syntax
- Naming: `{templateId}.txt` (e.g., `temple-interview.txt`)

**Trello Data Fetching:**
- Reuse existing Trello API client patterns
- List IDs should be configurable (env var or config)
- Phone number location (field vs description parsing) TBD

**SMS Link Format:**
- Android: `sms:<phone>?body=<encoded_message>`
- URL encoding required for message body
- 160 char limit per SMS (user awareness)

## Success Criteria

v1 is successful when:
1. User can fetch contacts from Trello lists
2. For each contact: select message type, assign time block, verify phone, edit message
3. User approves messages one-by-one
4. Approved messages generate clickable SMS links
5. User can send messages via phone SMS app

---
*Last updated: 2026-02-13*

# E2E Test Plan - Executive Secretary Tools

## Overview

This document outlines the plan for implementing end-to-end (E2E) tests using Playwright for all features in the Executive Secretary Tools application.

---

## Pre-Requisites

### 1. Install Docker Desktop (Intel Mac)

```bash
brew install --cask docker
# Then open Docker Desktop from Applications
```

---

## Code Modifications Required

### 2. Add Trello Base URL Config

Create a new env var `TRELLO_BASE_URL` that defaults to `https://api.trello.com`:

Files to modify:
- `src/requests/cards/requests.ts`
- `src/requests/members/requests.ts`
- `src/utils/trello-youth.ts`
- `src/features/youth/utils/trello-youth.ts`

### 3. Enable Test-Login for Test Mode

Modify two files to allow `NODE_ENV === "test"`:

| File | Change |
|------|--------|
| `src/app/api/auth/test-login/route.ts:6` | Change to `!["development", "test"].includes(process.env.NODE_ENV)` |
| `src/utils/auth-options.ts:13` | Change to `["development", "test"].includes(process.env.NODE_ENV)` |

---

## Architecture

### Core Philosophy

Mock **external third-party services** (Trello) at the network boundary. Run **everything else real** — Next.js server, server actions, Redis, middleware, auth.

### The Stack

| Concern | Solution |
|---------|----------|
| Browser automation | Playwright |
| Next.js server | `next build && next start` via `webServer` |
| Redis | Docker container, test-scoped (port 6399) |
| Trello | MSW in Node mode (network interception) |
| Auth | Real NextAuth, session seeded via test-login endpoint |
| Env isolation | `.env.test` with test-specific values |

---

## E2E Directory Structure

```
e2e/
├── playwright.config.ts              # Config with webServer, MSW
├── global-setup.ts                    # Docker Redis + MSW HTTP server
├── global-teardown.ts                 # Container cleanup
├── .env.test                         # Test env vars
├── fixtures/
│   ├── seed/
│   │   ├── index.ts                  # Main seeding API (composable)
│   │   ├── youth.ts                  # Youth seeding
│   │   ├── templates.ts              # Template seeding
│   │   ├── conductors.ts             # Conductor seeding
│   │   └── contacts.ts               # Contact seeding
│   ├── trello/
│   │   ├── handlers.ts               # MSW handlers (reused from src)
│   │   └── index.ts                  # Handler setup
│   ├── session.ts                    # Auth session seeding
│   └── redis.ts                      # Redis connection
└── tests/
    ├── dashboard.spec.ts
    ├── messages.spec.ts
    ├── interviews.spec.ts
    ├── youth/
    │   ├── queue.spec.ts
    │   ├── add.spec.ts
    │   └── import.spec.ts
    ├── conductors.spec.ts
    └── templates.spec.ts
```

---

## Test Data Isolation

### Redis

- Use Docker container on port 6399 (non-default to avoid collision)
- Flush database before each test via `flushdb()`
- Test data stored in Redis DB index 1

### Trello API

- Use MSW in Node mode to intercept HTTP requests
- Extend existing handlers from `src/test/handlers.ts`
- Per-test handler overrides via `server.use()`

### Auth

- Use existing `/api/auth/test-login` endpoint
- Works in both `development` and `test` modes

---

## Composable Seeding API

```typescript
// Usage examples:
await seed.youth.single("John Smith");
await seed.youth.single("Jane", { preferredName: "Janie", lastSeenAt: new Date("2024-06-01") });
await seed.youth.queue([{ name: "Alice" }, { name: "Bob", options: { preferredName: "Bobby" } }]);
await seed.youth.withVisits("Charlie", [{ visitedAt: new Date(), visitType: "Home Teaching" }]);

await seed.templates.single({ name: "Interview", content: "Hi {recipient}...", category: "interview" });
await seed.templates.category("interview", [...]);

await seed.conductors.rotation([...conductors]);
await seed.conductors.override("Ryan Preece", "Vacation");

await seed.contacts.interview({ name: "John", phone: "555-1234" });
await seed.contacts.messaged(["contact-id-1"]);

await seed.flush(); // Clear all test data
```

---

## Happy Path Test Scenarios

### 1. Dashboard (`/`)

- [ ] Loads with greeting and 4 stat cards
- [ ] Each stat card navigates to correct page
- [ ] Quick action buttons navigate correctly
- [ ] Navigation links work

### 2. Messages (`/messages`)

- [ ] Loads contacts from Trello
- [ ] Select contact → choose template → preview → send
- [ ] Merge 2+ contacts into group
- [ ] Mark contacts as messaged (writes to Redis)
- [ ] Unmark contacts (removes from Redis)
- [ ] Toggle "Show messaged" filter

### 3. Interviews (`/interviews`)

- [ ] Shows "Interviews for Sunday [date]" header
- [ ] Groups by bishopric member
- [ ] Separates Before Church / After Church
- [ ] Empty state when no interviews
- [ ] Error state with retry

### 4. Youth Queue (`/youth`)

- [ ] Displays youth cards in queue
- [ ] Schedule visit modal creates visit
- [ ] Edit youth updates name/last seen
- [ ] Delete youth removes from queue
- [ ] Sync with Trello marks visits complete
- [ ] Pending reviews flow

### 5. Add Youth (`/youth/new`)

- [ ] Form validation (required name)
- [ ] Submit creates youth in Redis
- [ ] Redirects to queue on success

### 6. Import Youth (`/youth/import`)

- [ ] Parses multiple names (one per line)
- [ ] Creates all youth in Redis
- [ ] Redirects to queue on success

### 7. Conductors (`/conductors`)

- [ ] Shows current and next conductor
- [ ] Set override updates Redis
- [ ] Clear override removes from Redis
- [ ] Advance rotation (with confirmation)

### 8. Templates (`/templates`)

- [ ] Lists templates by category
- [ ] Search filters templates
- [ ] Create template (writes to Redis)
- [ ] Edit template updates Redis
- [ ] Delete template removes from Redis
- [ ] Preview with variable substitution

### 9. Sign In (`/auth/signin`)

- [ ] Shows Google sign in button
- [ ] Click initiates OAuth flow

---

## Test Priority Order

| Priority | Page | Reason |
|----------|------|--------|
| 1 | Dashboard | Simplest, good warm-up |
| 2 | Templates | Redis only, no Trello |
| 3 | Conductors | Redis + mock Slack |
| 4 | Interviews | Read-only, Trello data |
| 5 | Youth Queue | Complex, Redis + Trello |
| 6 | Messages | Redis + Trello + SMS link |

---

## Server Action Mocking Summary

| Server Action File | Redis Keys | External | Mock Strategy |
|--------------------|------------|----------|---------------|
| `conductors/actions.ts` | `church:conductors:*` | Slack API | Playwright route |
| `templates.ts` | `church:templates:*` | - | Redis test DB |
| `youth.ts` | `youth:queue`, `youth:*` | - | Redis test DB |
| `youth-visits.ts` | `youth:*` | Trello | MSW handler |
| `youth-pending-reviews.ts` | `youth:pendingReviews` | Trello | MSW handler |

---

## Implementation Steps

1. Install Docker Desktop via Homebrew
2. Add `TRELLO_BASE_URL` env var support
3. Enable test-login for test mode
4. Create e2e directory structure
5. Set up playwright.config.ts with webServer
6. Implement global-setup/teardown for Redis + MSW
7. Create composable seeding functions
8. Port/extend MSW handlers
9. Write tests in priority order

---

## Notes

- Tests run against a real Next.js server (built and started)
- Only Trello API is mocked via MSW
- Redis is isolated to a test container
- Auth uses real NextAuth sessions
- Slack calls mocked via Playwright route interception

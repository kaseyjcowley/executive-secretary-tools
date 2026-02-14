# Architecture

**Analysis Date:** 2026-02-13

## Pattern Overview

**Overall:** Server-Rendered Web Application with API Routes

**Key Characteristics:**
- Next.js 13+ with App Router
- Server-side data fetching from Trello API
- Slack integration for notifications
- Component-based UI with Tailwind CSS
- Functional programming style with Ramda

## Layers

**API Layer:**
- Purpose: HTTP endpoints for data fetching and external integrations
- Location: `src/app/api/`
- Contains: Route handlers for Trello data, Slack notifications, cron jobs
- Depends on: Request handlers, external API clients
- Used by: Web app, external services (Slack)

**Data Layer:**
- Purpose: Business logic and data transformation
- Location: `src/requests/`
- Contains: API request functions, data types, transformers
- Depends on: External APIs (Trello), internal utilities
- Used by: API layer, components (via data layer)

**UI Layer:**
- Purpose: Presentation components and page layouts
- Location: `src/app/`, `src/components/`
- Contains: React components, pages, layouts
- Depends on: Data layer for props, styling utilities
- Used by: End users, browsers

**Utilities Layer:**
- Purpose: Shared utilities and helpers
- Location: `src/utils/`
- Contains: Date utilities, functional helpers, URL builders
- Depends on: External libraries (date-fns)
- Used by: All other layers

## Data Flow

**Interview Data Flow:**

1. Client requests interviews page
2. Server calls Trello API via `fetchAllCardsGroupedByMember()`
3. Trello returns card data
4. Data is transformed: filtered for next Sunday, members hydrated, cards grouped
5. Processed data passed to InterviewsTable components
6. Tables render interviews grouped by member, before/after church

**Slack Notification Flow:**

1. Trigger (cron/manual) calls Slack API endpoint
2. Endpoint fetches current interviews from `/api/interviews`
3. Interviews formatted with template
4. Message posted to appropriate Slack channel
5. Response returned

## Key Abstractions

**TrelloCard:**
- Purpose: Represents Trello card with custom properties
- Examples: `src/requests/cards/types.ts`
- Pattern: Type transformation and augmentation

**InterviewTable:**
- Purpose: Displays interviews for a specific member
- Examples: `src/components/InterviewsTable.tsx`
- Pattern: Component composition with time-based filtering

**Transformer Pipeline:**
- Purpose: Data processing using functional composition
- Examples: `src/utils/transformers.ts`
- Pattern: Ramda pipeAsync for sequential transformations

## Entry Points

**Web Application:**
- Location: `src/app/interviews/page.tsx`
- Triggers: User navigation to interviews page
- Responsibilities: Fetch and display interview data, provide UI

**API Endpoints:**
- `src/app/api/interviews/route.ts` - Get interview data
- `src/app/api/post-interviews-to-slack/route.ts` - Post to Slack
- `src/app/api/post-prayers-to-slack/route.ts` - Prayer notifications
- `src/app/api/post-ward-council-reminder/route.ts` - Council reminders
- `src/app/api/slack/interactivity/route.ts` - Slack interactivity
- `src/app/api/crons/speakers/route.ts` - Speaker scheduling

**Background Jobs:**
- Triggered: Via external cron service or manual
- Purpose: Automated notifications and data processing

## Error Handling

**Strategy:** Graceful degradation with console logging

**Patterns:**
- Catch errors in API fetches with .catch()
- Return error pages when data fetching fails
- Type assertions with @ts-expect-error where needed

## Cross-Cutting Concerns

**Logging:** Console.error for API failures, console.log for debugging
**Validation:** Minimal validation, relies on Trello API structure
**Authentication:** Via environment variables for API access
**Caching:** No-cache strategy for Trello API calls, dynamic rendering

---

*Architecture analysis: 2026-02-13*

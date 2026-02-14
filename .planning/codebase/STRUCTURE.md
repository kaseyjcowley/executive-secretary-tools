# Codebase Structure

**Analysis Date:** 2026-02-13

## Directory Layout

```
/Users/kjc/Code/exec-secretary-tools/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API route handlers
│   │   ├── interviews/     # Interviews page
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable UI components
│   ├── constants.ts        # Application constants
│   ├── requests/           # Data layer and API calls
│   │   ├── cards/         # Trello card operations
│   │   └── members/       # Trello member operations
│   ├── utils/             # Utility functions
│   └── interviews-slack-template.txt  # Slack message template
├── public/                # Static assets
├── .vercel/              # Vercel configuration
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies
└── tailwind.config.ts   # Tailwind CSS configuration
```

## Directory Purposes

**`src/app/`**:
- Purpose: Next.js App Router pages and API routes
- Contains: Route handlers, page components, layout
- Key files: `api/interviews/route.ts`, `interviews/page.tsx`, `layout.tsx`

**`src/components/`**:
- Purpose: Reusable UI components
- Contains: Interview-related UI elements
- Key files: `InterviewsTable.tsx`, `InterviewRow.tsx`

**`src/requests/`**:
- Purpose: Data fetching and business logic
- Contains: Trello API calls, data transformations, types
- Key files: `cards/requests.ts`, `members/requests.ts`

**`src/utils/`**:
- Purpose: Shared utilities and helper functions
- Contains: Date utilities, functional helpers, transformers
- Key files: `transformers.ts`, `dates.ts`, `helpers.ts`

## Key File Locations

**Entry Points:**
- `src/app/interviews/page.tsx`: Main application page
- `src/app/api/interviews/route.ts`: API endpoint for interview data

**Configuration:**
- `next.config.js`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `constants.ts`: Application constants and IDs

**Core Logic:**
- `src/requests/cards/`: Interview and calling card processing
- `src/requests/members/`: Member data fetching
- `src/utils/transformers.ts`: Data transformation utilities

**Testing:**
- No test files detected in current structure

## Naming Conventions

**Files:**
- Routes: `route.ts` (Next.js convention)
- Components: PascalCase (`InterviewsTable.tsx`)
- Utilities: camelCase (`transformers.ts`, `dates.ts`)
- Types: Lowercase with plural (`cards`, `members`)

**Directories:**
- Feature-based: lowercase with dashes when needed
- Component groups: lowercase plural (`components`, `utils`)
- API groups: lowercase plural (`api`, `requests`)

**Variables and Functions:**
- Functions: camelCase with verbs (`fetchAllCardsGroupedByMember`)
- Constants: SCREAMING_SNAKE_CASE (`BISHOPRIC_MEMBER_IDS`)
- Components: PascalCase (`InterviewsTable`)
- Types: PascalCase with interfaces

## Where to Add New Code

**New Feature:**
- Primary code: `src/app/` (new page) or `src/components/` (component)
- API endpoints: `src/app/api/[feature]/route.ts`
- Business logic: `src/requests/[feature]/`
- Tests: Create `__tests__/` or `src/__tests__/` directory

**New Component/Module:**
- Implementation: `src/components/[ComponentName].tsx`
- Styles: Follow Tailwind CSS convention
- Props: Define in component file with TypeScript interface

**Utilities:**
- Shared helpers: `src/utils/[name].ts`
- Feature-specific utilities: `src/requests/[feature]/utils/`

## Special Directories

**`src/app/api/`**:
- Purpose: API route handlers for external integrations
- Generated: No
- Committed: Yes
- Contains: Trello data, Slack integrations, cron jobs

**`src/requests/`**:
- Purpose: Data access layer for external APIs
- Generated: No
- Committed: Yes
- Contains: API clients, transformers, types

**`src/components/`**:
- Purpose: Reusable UI components
- Generated: No
- Committed: Yes
- Contains: Interview display components

---

*Structure analysis: 2026-02-13*

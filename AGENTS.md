# AGENTS.md - Executive Secretary Tools

This document provides guidance for AI agents working in this codebase.

## Project Overview

A Next.js 13 application for church executive secretary workflow automation. Uses TypeScript, Tailwind CSS, and integrates with Slack and email services.

## Package Manager

**Always use pnpm for installing dependencies.**

```bash
# Install dependencies
pnpm install

# Add a dependency
pnpm add <package>
```

## Commands

```bash
# Development (only run if you need to verify visual/rendering changes)
pnpm dev          # Start development server on http://localhost:3000

# Building (avoid - takes too long to verify checks)
pnpm build        # Production build (DO NOT USE for verification)

# Linting
pnpm lint         # Run ESLint with Next.js config

# Type checking
pnpm tsc          # Run TypeScript compiler (or use next build which includes it)
```

### Running a Single Test

No test framework is currently configured. Tests would be added using a framework like Jest or Vitest. To add tests:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

Then run individual test files:

```bash
pnpm vitest run src/utils/helpers.test.ts
```

## Code Style

### Formatting

- **Tool**: Prettier
- **Indentation**: 2 spaces
- **Quotes**: Double quotes (single quotes in JSX attributes)
- **Semicolons**: Always included
- **Line length**: Default (typically 80-100 chars)

### Linting

- **Tool**: ESLint with `next/core-web-vitals` config
- Run `pnpm lint` before committing

### TypeScript

- **Strict mode**: Enabled in tsconfig.json
- **Path aliases**: Use `@/*` for src imports
  - `@/components/*` → `src/components/*`
  - `@/utils/*` → `src/utils/*`
  - `@/requests/*` → `src/requests/*`
  - `@/constants/*` → `src/constants/*`

## Naming Conventions

| Type             | Convention    | Example                                  |
| ---------------- | ------------- | ---------------------------------------- |
| Components       | PascalCase    | `InterviewsTable.tsx`                    |
| Utilities        | camelCase     | `helpers.ts`, `slack.ts`                 |
| Types/Interfaces | PascalCase    | `ApiMember`, `SlackInteractivityPayload` |
| Functions        | camelCase     | `getMemberName`, `handleSubmit`          |
| Constants        | camelCase     | `slackChannel`, `dryRun`                 |
| Files (types)    | `types.ts`    | Group in module folder                   |
| Files (requests) | `requests.ts` | API call modules                         |

## Import Organization

Order imports as follows:

1. React imports: `import { Fragment } from "react";`
2. External libraries: `import { format } from "date-fns";`
3. Path aliases: `import { InterviewsTable } from "@/components/InterviewsTable";`

```typescript
// Example
import getHours from "date-fns/getHours";
import { utcToZonedTime } from "date-fns-tz";

import { CallingTrelloCard, InterviewTrelloCard } from "@/requests/cards";
import { getMemberName } from "@/requests/members";
import { InterviewRow } from "./InterviewRow";
```

## Error Handling

```typescript
// Try-catch for operations
try {
  const result = await someOperation();
} catch (err) {
  console.error("Error description:", err);
}

// Optional chaining with fallbacks
const metadata = JSON.parse(payload.view.private_metadata) || {};

// Default values using Rambdax
import { defaultTo, path } from "rambdax";
const values = defaultTo({}, path(["state", "values"]));
```

## React Component Patterns

- Use functional components exclusively
- Use TypeScript interfaces for props
- Destructure props with explicit typing
- Prefer explicit returns over implicit

```typescript
interface Props {
  memberId: string;
  interviews: Array<InterviewTrelloCard | CallingTrelloCard>;
}

export const InterviewsTable = ({ memberId, interviews }: Props) => {
  return (/* JSX */);
};
```

## API Routes

- Use Next.js App Router in `/src/app/api/`
- Use POST method only for mutations
- Return JSON responses

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Handle request
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error message", { status: 500 });
  }
}
```

## Functional Programming

- Uses Rambdax (Ramda extension) for data transformations
- Prefer pure functions
- Use pipe composition for transformations

```typescript
import { pipe, values, length } from "rambdax";

export const size = pipe(values, length);
```

## Logging

Use console.log and console.error with descriptive messages:

```typescript
console.log(`Sending email to ${recipient} with date: ${formattedDate}`);
console.error("Failed to parse payload:", err);
```

## Tailwind CSS

- Use utility classes for styling
- Custom config in `tailwind.config.ts`
- Content paths: `./src/components/**/*`, `./src/app/**/*`

```typescript
// Example
<div className="text-2xl text-slate-900 mb-2">Title</div>
```

## File Structure

```
src/
├── app/               # Next.js App Router pages and API routes
├── components/        # React components (UI + feature components)
├── constants.ts       # Application constants
├── requests/          # API call modules (members, cards, etc.)
├── utils/             # Utility functions
└── templates/         # Message templates
```

## Development Workflow

1. Install deps: `pnpm install`
2. Make changes
3. Run lint: `pnpm lint`
4. Verify no TypeScript errors (build includes type check)
5. **Only run dev server (`pnpm dev`) if you need to verify visual/rendering changes**

## Key Dependencies

- **Framework**: Next.js 13.4
- **Styling**: Tailwind CSS 3.3
- **Data**: date-fns, date-fns-tz, Rambdax
- **Integrations**: @slack/bolt, googleapis, nodemailer
- **Search**: fuse.js (fuzzy matching)
- **Caching**: ioredis (Redis)

# Coding Conventions

**Analysis Date:** 2024-02-13

## Naming Patterns

**Files:**
- Components: PascalCase (`InterviewsTable.tsx`)
- Utilities: camelCase (`helpers.ts`, `slack.ts`)
- Types: `types.ts`
- Requests: `requests.ts`
- Constants: `constants.ts`

**Functions:**
- Exported functions: camelCase (`size`, `getClosestSunday`)
- Handler methods: camelCase (`handle`, `initialSpeakerBlockBuilders`)
- Factory methods: camelCase (`create`)

**Variables:**
- Local variables: camelCase (`extractValuesFromView`, `speakers`, `recipient`)
- Constants: camelCase (`slackChannel`, `dryRun`)
- Class properties: camelCase (`INITIAL_INPUT_NUMBER`)

**Types:**
- Interface names: PascalCase (`ApiMember`, `SlackInteractivityPayload`)
- Type aliases: PascalCase (`HandlerIdentifier`, `StateValues`)
- Generic parameters: single letter (`T`, `U`) or descriptive names

## Code Style

**Formatting:**
- Tool: Prettier
- Indentation: 2 spaces
- Semicolons: Always included
- Quotes: Double quotes (unless JSX attributes)

**Linting:**
- Tool: ESLint
- Config: `next/core-web-vitals`
- Rules: Standard Next.js ESLint configuration enforced

## Import Organization

**Order:**
1. React imports: `import { Fragment } from "react";`
2. External library imports: `import { format } from "date-fns";`
3. Relative imports: `import { InterviewsTable } from "@/components/InterviewsTable";`

**Path Aliases:**
- `@/components/` → `src/components/`
- `@/utils/` → `src/utils/`
- `@/requests/` → `src/requests/`
- `@/constants/` → `src/constants/`

## Error Handling

**Patterns:**
```typescript
try {
  // API calls, file operations
} catch (err) {
  console.error("Error description:", err);
  // Log errors but don't necessarily throw
}

// Optional chaining with fallbacks
const metadata = JSON.parse(payload.view.private_metadata) || {};

// Default values for undefined paths
R.defaultTo({}, R.path(["state", "values"]))
```

**Type Safety:**
- Extensive use of TypeScript interfaces and types
- Optional chaining (`?.`) for potentially undefined values
- Null checks before operations

## Logging

**Framework:** Console logging

**Patterns:**
```typescript
// Success logging
console.log(`Operation completed: ${result}`);

// Error logging
console.error("Error during operation:", err);

// Debug logging with context
console.log(`Sending email to ${recipient} with date: ${formattedDate}`);
```

**Usage:**
- Operations with side effects (email sending, Slack posting)
- Performance-critical operations
- Error context and recovery

## Comments

**When to Comment:**
- Complex data extraction logic
- Business rule explanations
- TODO items for future improvements
- Integration points with external services

**JSDoc/TSDoc:**
- Currently minimal usage
- Focus on complex class methods
- Handler methods use inline comments for logic flow

## Function Design

**Size:**
- Generally small, focused functions
- Complex logic broken into multiple steps with clear variable names
- Handler classes keep methods within reasonable size

**Parameters:**
- Prefer object destructuring for multiple parameters
- Optional parameters clearly marked with `?`
- Default values provided where appropriate

**Return Values:**
- Promise-based for async operations
- Void for operations that don't need return values
- Consistent return types within similar operations

## Module Design

**Exports:**
- Named exports over default exports
- Utility functions in `export` position at module level
- Type definitions in separate `types.ts` files

**Barrel Files:**
- Usage in `/src/requests/` and `/src/components/`
- All main exports visible from index files
- Internal utilities not exported

## React Component Patterns

**Functional Components:**
- All components are async functions
- Server-side rendering without state management
- TypeScript interfaces for props

**Props:**
- Destructuring with explicit typing
- Clear naming for member IDs and data structures

## API Route Patterns

**Structure:**
- Next.js API routes in `/src/app/api/`
- Strict POST method enforcement
- Environment variable injection via `process.env`
- JSON response format with success indicators

## Utility Patterns

**Functional Programming:**
- Heavy use of Rambdax (ramda extension)
- Pipe composition for complex data transformations
- Pure functions where possible

**Redis Integration:**
- Expiration-based caching patterns
- Key naming conventions with date prefixes
- Error handling for Redis operations
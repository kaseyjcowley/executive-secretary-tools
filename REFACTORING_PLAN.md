# Refactoring Plan - Executive Secretary Tools

**Created:** March 12, 2026  
**Status:** Ready for Execution  
**Estimated Passes:** 12

---

## Philosophy

This refactoring follows these principles:

1. **Clarity over brevity** - Readable code beats clever code
2. **Small, contained passes** - One goal per pass, never combine goals
3. **Build on prior passes** - Earlier passes unlock later ones
4. **Leave behavior unchanged** - No bug fixes or feature additions
5. **Verify after every pass** - All tests, type checks, and lint must pass

---

## Current State Analysis

### Strengths

- Good test coverage with tests alongside code
- TypeScript throughout
- Clear separation of API routes
- Modern Next.js 13 App Router

### Issues to Address

1. **Flat component structure** - 23 components in single folder
2. **Large components** - ContactRow (290 lines), GroupCard (286 lines), YouthQueuePage (380 lines)
3. **Hooks with multiple responsibilities** - `useRecipientSubjectSelection` manages recipients, subjects, phone numbers, and effects
4. **Utils folder bloat** - 36 utility files with mixed purposes
5. **Feature coupling** - messages, youth, and interviews features mixed in `/components`
6. **Direct data imports** - Components import `members.json` directly
7. **No data fetching hooks** - Components and pages fetch data inline

---

## Refactoring Priorities

1. **Hook Single Responsibility** - Split hooks by concern
2. **Component Single Responsibility** - Decompose large components
3. **File System Structure** - Group by feature/domain
4. **Open/Closed Principle** - Prefer composition
5. **Naming** - Descriptive names over comments

---

## Pass Sequence

### Pass 1 — Extract Message Preview Logic

**Goal:** Extract message generation and preview state into dedicated hook

**Why now:** ContactRow and GroupCard both duplicate preview generation logic; this is the clearest duplication to fix first

**Changes:**

- Create `src/hooks/useMessagePreview.ts`
- Extract preview state, loading state, and generation logic
- Update ContactRow and GroupCard to use new hook
- Create `src/hooks/useMessagePreview.test.ts`

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Ensure abort controller behavior is preserved

---

### Pass 2 — Split useRecipientSubjectSelection Hook

**Goal:** Split into `useMemberSelection` (state management) and `useMemberPhoneNumbers` (derived data)

**Why now:** Unlocked by Pass 1 because preview logic no longer depends on phone number derivation being in the same hook

**Changes:**

- Create `src/hooks/useMemberSelection.ts` - handles state and actions
- Create `src/hooks/useMemberPhoneNumbers.ts` - handles phone number derivation
- Update `useRecipientSubjectSelection` to compose these hooks
- Update tests in `useRecipientSubjectSelection.test.ts`

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Ensure dependent components get all needed values

---

### Pass 3 — Create Feature Folders (messages)

**Goal:** Move messages-related components into `/features/messages/`

**Why now:** After simplifying hooks, components are easier to move without breaking imports

**Changes:**

- Create `/src/features/messages/` structure
- Move components:
  - ContactRow.tsx → features/messages/components/
  - ContactList.tsx → features/messages/components/
  - GroupCard.tsx → features/messages/components/
  - ContactInfo.tsx → features/messages/components/
  - MergeToolbar.tsx → features/messages/components/
  - MemberSelector.tsx → features/messages/components/
  - TemplateSelector.tsx → features/messages/components/
  - TimeSelector.tsx → features/messages/components/
  - MessagePreview.tsx → features/messages/components/
  - MarkAsMessagedToast.tsx → features/messages/components/
- Move hooks:
  - useRecipientSubjectSelection.ts → features/messages/hooks/
  - useGroupRecipients.ts → features/messages/hooks/
  - useGroupSubjects.ts → features/messages/hooks/
  - useMessagedContacts.ts → features/messages/hooks/
  - useMemberSelection.ts → features/messages/hooks/
  - useMemberPhoneNumbers.ts → features/messages/hooks/
  - useMessagePreview.ts → features/messages/hooks/
- Update all import paths
- Move tests alongside files

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Large number of import path updates

---

### Pass 4 — Create Feature Folders (youth)

**Goal:** Move youth-related components into `/features/youth/`

**Why now:** Builds on folder structure pattern from Pass 3

**Changes:**

- Create `/src/features/youth/` structure
- Move components:
  - YouthCard (from page.tsx) → features/youth/components/
  - ScheduleVisitModal.tsx → features/youth/components/
  - EditLastSeenModal.tsx → features/youth/components/
- Keep page.tsx in `/src/app/youth/`
- Update import paths

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Modal components may have dependencies to verify

---

### Pass 5 — Extract Data Fetching Hooks (messages)

**Goal:** Create `useContacts`, `useMessagedStatus` hooks for data fetching

**Why now:** After components are in feature folders, data fetching patterns are clearer

**Changes:**

- Create `src/features/messages/hooks/useContacts.ts`
  - Fetch contacts from API
  - Handle loading/error states
  - Sort contacts by label
- Create `src/features/messages/hooks/useMessagedStatus.ts`
  - Fetch and cache messaged contact IDs
  - Provide mark/unmark actions
- Update ContactList to use new hooks
- Create tests:
  - `useContacts.test.ts`
  - `useMessagedStatus.test.ts`

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Server components currently fetch data; verify client component boundaries

---

### Pass 6 — Extract Data Fetching Hooks (youth)

**Goal:** Create `useYouthQueue` hook for queue data and mutations

**Why now:** YouthQueuePage has inline fetch/sync/delete logic that belongs in a hook

**Changes:**

- Create `src/features/youth/hooks/useYouthQueue.ts`
  - Fetch queue data
  - Handle sync, delete, reset operations
  - Manage loading states
- Update YouthQueuePage to use hook
- Create test: `useYouthQueue.test.ts`

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Toast notifications and error handling must be preserved

---

### Pass 7 — Decompose ContactRow Component

**Goal:** Split ContactRow into smaller, focused components

**Why now:** After hooks are extracted, component is simpler to decompose

**Changes:**

- Extract components:
  - `ContactRowHeader.tsx` - Name, badges, checkbox
  - `ContactMemberSelector.tsx` - Recipient and subject selection
  - `ContactTemplateSelector.tsx` - Template and time selection
  - `ContactPreview.tsx` - Message preview and send
- ContactRow becomes composition of these components
- Update tests to reflect new structure

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Layout and styling must be preserved

---

### Pass 8 — Decompose GroupCard Component

**Goal:** Split GroupCard into smaller, focused components

**Why now:** Same pattern as ContactRow decomposition

**Changes:**

- Extract components:
  - `GroupHeader.tsx` - Title, badges, unmerge button
  - `GroupRecipientStep.tsx` - Step 1: recipient selection
  - `GroupSubjectStep.tsx` - Step 2: subject and template selection
  - `GroupPreview.tsx` - Message preview and send
- GroupCard becomes composition of these components
- Update tests to reflect new structure

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Step-based UI flow must remain clear

---

### Pass 9 — Consolidate Utils

**Goal:** Move domain-specific utils to feature folders, generic utils to `/lib/`

**Why now:** After features are organized, utils destinations are clear

**Changes:**

- Move to `/src/features/messages/utils/`:
  - contact-fuzzy-match.ts
  - contact-ordering.ts
  - template-loader.ts
  - template-matcher.ts
  - template-substitution.ts
  - grammar.ts
  - group-message.ts
- Move to `/src/features/youth/utils/`:
  - youth-queue.ts
  - trello-youth.ts
- Move to `/src/lib/utils/`:
  - date-formatters.ts
  - dates.ts
  - time-utils.ts
  - helpers.ts
  - urls.ts
- Keep in `/src/utils/` (API/client related):
  - slack.ts
  - email.ts
  - redis.ts
  - auth-options.ts
- Update all import paths

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Large number of import updates

---

### Pass 10 — Extract Shared UI Components

**Goal:** Move truly reusable components to `/components/ui/`, keep feature-specific in feature folders

**Why now:** After feature extraction, shared vs. feature-specific is clear

**Changes:**

- Review components in `/src/components/ui/`
- Move generic components there (if any)
- Keep feature-specific components in feature folders
- Delete empty `/src/components/` directory

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Over-extracting components that are only used once

---

### Pass 11 — Add Loading/Error Boundaries

**Goal:** Create reusable LoadingSkeleton and ErrorState components per feature

**Why now:** After structure is finalized, standardize loading/error patterns

**Changes:**

- Create `/src/features/messages/components/MessagesLoadingSkeleton.tsx`
- Create `/src/features/messages/components/MessagesErrorState.tsx`
- Create `/src/features/youth/components/YouthLoadingSkeleton.tsx`
- Create `/src/features/youth/components/YouthErrorState.tsx`
- Update pages to use these components
- Remove duplicate loading/error components

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Ensure Suspense boundaries are correctly placed

---

### Pass 12 — Type Safety Improvements

**Goal:** Move types from `/types/` into feature folders, create stricter types for API responses

**Why now:** After features are organized, types belong with their features

**Changes:**

- Move to `/src/features/messages/types/`:
  - messages.ts → index.ts or messages.types.ts
- Move to `/src/features/youth/types/`:
  - youth.ts → index.ts or youth.types.ts
- Keep in `/src/types/`:
  - conductors.ts (shared)
- Create API response types in feature folders
- Update all import paths
- Remove `any` types where possible

**Verification:**

```bash
pnpm lint && pnpm tsc && pnpm test
```

**Risk:** Ensure no type errors sneak in during moves

---

## Final Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (stay here)
│   ├── messages/page.tsx         # Thin page component
│   ├── youth/page.tsx            # Thin page component
│   └── interviews/page.tsx       # Thin page component
│
├── features/                     # Feature-based organization
│   ├── messages/
│   │   ├── components/           # Message-specific components
│   │   ├── hooks/                # Message-specific hooks
│   │   ├── utils/                # Message-specific utils
│   │   └── types/                # Message-specific types
│   │
│   └── youth/
│       ├── components/           # Youth-specific components
│       ├── hooks/                # Youth-specific hooks
│       ├── utils/                # Youth-specific utils
│       └── types/                # Youth-specific types
│
├── components/                   # Truly shared UI components only
│   └── ui/
│
├── lib/                          # Generic utilities and config
│   ├── utils/                    # Generic utilities
│   └── llm/                      # LLM integration
│
├── utils/                        # API/client utilities
│   ├── slack.ts
│   ├── email.ts
│   └── redis.ts
│
├── types/                        # Truly shared types only
│   └── conductors.ts
│
├── constants/                    # Application constants
├── data/                         # Static data
├── requests/                     # API request modules
└── test/                         # Test utilities
```

---

## Testing Strategy

- **Add tests** for new hooks as they're created
- **Rely on existing tests** to verify feature correctness after changes
- **Run full test suite** after each pass
- **Update tests** when moving files to maintain coverage

---

## Verification Commands

After each pass, run:

```bash
pnpm lint && pnpm tsc && pnpm test
```

Do not proceed if any command fails.

---

## Rollback Plan

Each pass should be committed separately:

```bash
git add .
git commit -m "refactor: Pass X - [Name]"
```

This allows easy rollback if issues are discovered later.

---

## Notes

- API routes remain in `/src/app/api/` (Next.js requirement)
- Server components can continue to fetch data directly
- Client components use hooks for data fetching
- Feature folders are self-contained
- Shared components are truly generic and reusable

---

## Execution Checklist

- [ ] Pass 1 — Extract Message Preview Logic
- [ ] Pass 2 — Split useRecipientSubjectSelection Hook
- [ ] Pass 3 — Create Feature Folders (messages)
- [ ] Pass 4 — Create Feature Folders (youth)
- [ ] Pass 5 — Extract Data Fetching Hooks (messages)
- [ ] Pass 6 — Extract Data Fetching Hooks (youth)
- [ ] Pass 7 — Decompose ContactRow Component
- [ ] Pass 8 — Decompose GroupCard Component
- [ ] Pass 9 — Consolidate Utils
- [ ] Pass 10 — Extract Shared UI Components
- [ ] Pass 11 — Add Loading/Error Boundaries
- [ ] Pass 12 — Type Safety Improvements

---

**Ready to begin? Execute Pass 1.**

# Test Coverage Plan for ContactRow and Related Code

## Overview

This document outlines the test coverage plan for the ContactRow component and its related utilities, hooks, and child components. The goal is to ensure adequate test coverage before performing major cleanup/refactoring of that area of code.

## Current Test Coverage Status

### ✅ Well-Tested Modules

| Module                              | Test File                                        | Coverage                                                |
| ----------------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `useRecipientSubjectSelection` hook | `src/hooks/useRecipientSubjectSelection.test.ts` | Good - initialization, add/remove/change, phone numbers |
| `classifyScenario`                  | `src/utils/message-generator.test.ts`            | Good - all scenario types covered                       |
| `generateMessage` (sync paths only) | `src/utils/message-generator.test.ts`            | Partial - only non-LLM paths                            |
| `getBeforeOrAfterChurch`            | `src/utils/time-utils.test.ts`                   | Good                                                    |
| `grammar` utilities                 | `src/utils/grammar.test.ts`                      | Good                                                    |
| `substituteTemplate`                | `src/utils/template-substitution.test.ts`        | Good                                                    |

### ❌ Gaps in Test Coverage

#### ContactRow.test.tsx - Major Gaps

- ❌ No tests for template selection
- ❌ No tests for time selection
- ❌ No tests for member selector interactions (add/remove/change)
- ❌ No tests for `recipientsAreSubjects` toggle
- ❌ No tests for "Generate Message" button click
- ❌ No tests for `generatePreview()` function (success, error, abort)
- ❌ No tests for loading state (`isLoadingPreview`)
- ❌ No tests for `canShowPreview`/`canGenerate` conditions
- ❌ No tests for subject selector conditional visibility

#### Child Components - Completely Untested

- ❌ `src/components/MemberSelector.tsx`
- ❌ `src/components/TemplateSelector.tsx`
- ❌ `src/components/TimeSelector.tsx`
- ❌ `src/components/MessagePreview.tsx`
- ❌ `src/components/ContactInfo.tsx`

#### Utilities - Missing Tests

- ❌ `src/utils/contact-fuzzy-match.ts` - only mocked, no direct unit tests
- ❌ `src/utils/date-formatters.ts` - no tests for `formatTimeForDisplay`, `formatAppointmentDate`

#### LLM Integration - No Tests

- ❌ `src/lib/llm/jobs/format-sms.ts`
- ❌ `src/app/api/llm/route.ts`
- ❌ Async `generateMessage` with API call

---

## Test Implementation Plan

### Phase 1: ContactRow Core Functionality (HIGH PRIORITY)

These tests are critical before refactoring since they cover the main user interactions.

#### 1.1 Test `generatePreview()` Function

```typescript
// Test file: src/components/ContactRow.test.tsx

describe("generatePreview", () => {
  it("should call generateMessage with correct scenario", async () => {
    // Setup: mock generateMessage
    // Render ContactRow with valid recipients
    // Click Generate Message button
    // Assert generateMessage was called with correct scenario
  });

  it("should set templatePreview on success", async () => {
    // Mock generateMessage to return a message
    // Click Generate Message
    // Assert templatePreview contains the message
  });

  it("should set error message on failure", async () => {
    // Mock generateMessage to throw
    // Click Generate Message
    // Assert templatePreview contains error message
  });

  it("should set isLoadingPreview to false after completion", async () => {
    // Click Generate Message
    // Assert isLoadingPreview is true
    // Wait for completion
    // Assert isLoadingPreview is false
  });

  it("should handle AbortError gracefully", async () => {
    // Setup AbortController with abort
    // Click Generate Message
    // Abort the controller
    // Assert no error is shown
  });
});
```

#### 1.2 Test Conditional Rendering

```typescript
describe("conditional rendering", () => {
  it("should show Generate button when canGenerate is true", () => {
    // Setup: valid template, valid recipients
    // Assert button is visible
  });

  it("should hide Generate button when template not selected", () => {
    // Setup: no template selected
    // Assert button is NOT visible
  });

  it("should hide Generate button when no recipients", () => {
    // Setup: template selected, no recipients
    // Assert button is NOT visible
  });

  it("should show subject selector when recipientsAreSubjects is false", () => {
    // Uncheck recipientsAreSubjects
    // Assert subject selector is visible
  });

  it("should hide subject selector when recipientsAreSubjects is true", () => {
    // Check recipientsAreSubjects
    // Assert subject selector is NOT visible
  });
});
```

#### 1.3 Test Member Selection Interactions

```typescript
describe("member selection", () => {
  it("should add recipient when Add button is clicked", async () => {
    // Click Add button
    // Assert recipientMemberIds includes new placeholder
  });

  it("should remove recipient when X button is clicked", async () => {
    // Add recipient
    // Click remove button
    // Assert recipient is removed
  });

  it("should not add more than MAX_RECIPIENTS (2)", async () => {
    // Try to add 3 recipients
    // Assert only 2 exist
  });

  it("should add subject when Add is clicked and recipientsAreSubjects is false", async () => {
    // Set recipientsAreSubjects to false
    // Click Add subject
    // Assert subjectMemberIds includes new placeholder
  });
});
```

#### 1.4 Test recipientsAreSubjects Toggle

```typescript
describe("recipientsAreSubjects checkbox", () => {
  it("should update recipientsAreSubjects state on change", async () => {
    // Toggle checkbox
    // Assert state updates
  });

  it("should clear subjectMemberIds when checked", async () => {
    // Add subjects
    // Check checkbox
    // Assert subjectMemberIds is empty
  });
});
```

### Phase 2: Child Components (MEDIUM PRIORITY)

#### 2.1 MemberSelector Tests

```typescript
// New file: src/components/MemberSelector.test.tsx

describe("MemberSelector", () => {
  it("should render selected members");
  it("should show Add button when under maxMembers");
  it("should hide Add button when at maxMembers");
  it("should call onRemoveMember when remove button clicked");
  it("should call onChangeMember when TypeAhead selection changes");
  it("should exclude already selected members from options");
});
```

#### 2.2 MessagePreview Tests

```typescript
// New file: src/components/MessagePreview.test.tsx

describe("MessagePreview", () => {
  it("should show loading spinner when isLoading is true");
  it("should show message when templatePreview has content");
  it("should show placeholder when no message and not loading");
  it("should render SMS link with correct href when phoneNumbers exist");
  it("should not render SMS link when no phoneNumbers");
});
```

#### 2.3 TemplateSelector Tests

```typescript
// New file: src/components/TemplateSelector.test.tsx

describe("TemplateSelector", () => {
  it("should render options grouped by category");
  it("should call onChange when selection changes");
  it("should show placeholder when no selection");
});
```

#### 2.4 TimeSelector Tests

```typescript
// New file: src/components/TimeSelector.test.tsx

describe("TimeSelector", () => {
  it("should render before church times");
  it("should render after church times");
  it("should call onChange when time is selected");
});
```

### Phase 3: Utilities (LOWER PRIORITY)

#### 3.1 Contact Fuzzy Match Tests

```typescript
// New file: src/utils/contact-fuzzy-match.test.ts

describe("contact-fuzzy-match", () => {
  describe("matchContact", () => {
    it("should return ID for exact match");
    it("should return ID for fuzzy match within threshold");
    it("should return undefined for no match");
    it("should return undefined if match score >= 0.4");
    it("should return undefined if member has no phone");
  });

  describe("getPhoneById", () => {
    it("should return phone for valid ID");
    it("should return undefined for invalid ID");
  });
});
```

#### 3.2 Date Formatters Tests

```typescript
// New file: src/utils/date-formatters.test.ts

describe("date-formatters", () => {
  describe("formatTimeForDisplay", () => {
    it("should format 24h time to 12h with AM/PM");
    it("should handle edge cases like midnight");
  });

  describe("formatAppointmentDate", () => {
    it("should return 'tomorrow' if tomorrow is Sunday");
    it("should return 'Sunday' otherwise");
  });
});
```

### Phase 4: LLM Integration (OPTIONAL - Lower Priority)

_These may be harder to test due to external dependencies. Consider integration tests instead._

#### 4.1 Format SMS Job Tests

```typescript
// New file: src/lib/llm/jobs/format-sms.test.ts

describe("formatSmsJob", () => {
  it("should construct prompt with template and recipients");
  it("should include optional fields when provided");
  it("should return formatted message");
});
```

#### 4.2 API Route Tests

```typescript
// New file: src/app/api/llm/route.test.ts

describe("/api/llm", () => {
  it("should return 401 if not authenticated");
  it("should return 400 if job not found");
  it("should execute job and return result");
  it("should handle job errors");
});
```

---

## Implementation Order

1. **Phase 1.1**: Test `generatePreview()` function - Most critical
2. **Phase 1.2**: Test conditional rendering - Critical for UI
3. **Phase 1.3**: Test member selection interactions - Critical
4. **Phase 1.4**: Test recipientsAreSubjects toggle - Critical
5. **Phase 2.1**: MemberSelector tests - Medium
6. **Phase 2.2**: MessagePreview tests - Medium
7. **Phase 2.3-2.4**: TemplateSelector/TimeSelector - Lower
8. **Phase 3.1-3.2**: Utility tests - Lower
9. **Phase 4**: LLM integration - Optional

---

## Notes

- All existing tests use **Vitest** with **@testing-library/react**
- Mock data is provided in `src/test/factories.ts`
- When adding tests, follow existing patterns in the test files
- Run tests with: `pnpm vitest run`
- For individual test files: `pnpm vitest run src/components/ContactRow.test.tsx`

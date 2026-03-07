# Test Evaluation Prompt for `/messages` Route

## Context

You are evaluating test files for the `/messages` route in a Next.js 13 church executive secretary application. The route manages appointment messaging for interviews and callings.

## Test Files to Evaluate

**Component Tests:**

- `/src/app/messages/page.test.tsx` - Main page component
- `/src/components/ContactList.test.tsx` - Contact list with selection/merging
- `/src/components/ContactRow.test.tsx` - Individual contact row
- `/src/components/GroupCard.test.tsx` - Group contact card
- `/src/components/MergeToolbar.test.tsx` - Merge selection toolbar

**Utility Tests:**

- `/src/utils/message-generator.test.ts` - Message generation logic
- `/src/utils/contact-ordering.test.ts` - Contact sorting logic
- `/src/utils/template-substitution.test.ts` - Template variable replacement
- `/src/utils/time-utils.test.ts` - Time formatting utilities
- `/src/utils/grammar.test.ts` - Grammar/wording utilities
- `/src/types/messages.test.ts` - Type guards and utilities

**Test Infrastructure:**

- `/src/test/test-utils.tsx` - Custom test utilities

## Features to Test (Reference)

### Core Features

1. **Data Fetching**

   - Fetch appointment contacts from Trello API
   - Handle both interview and calling contacts
   - Sort contacts by label priority

2. **Contact Display**

   - Render individual contacts
   - Show contact details (name, appointment type, due date)
   - Display calling-specific fields (calling name, stage)
   - Display interview-specific fields (labels)

3. **Template Management**

   - Auto-select templates based on contact type/label
   - Load template content from files
   - Support multiple template types (bishop interview, temple, welfare, etc.)
   - Handle template selection for calling stages

4. **Template Substitution**

   - Replace variables in templates (name, date, time, location)
   - Handle before/after church time formatting
   - Format appointment dates correctly

5. **Contact Selection**

   - Select/deselect individual contacts
   - Select all contacts at once
   - Clear selection
   - Track selection count

6. **Contact Merging/Grouping**

   - Merge multiple contacts into a group
   - Ungroup merged contacts
   - Handle group display
   - Manage group state

7. **Message Generation**

   - Generate single-recipient messages
   - Generate multi-recipient messages
   - Generate multi-subject messages
   - Generate multiple appointment type messages
   - Classify messaging scenarios (single, pair-recipients, pair-subjects, multiple-types)

8. **User Interactions**

   - Time selection (dropdowns)
   - Template selection (dropdowns)
   - Recipient selection (when different from subject)
   - Phone number display
   - Preview message generation

9. **Error Handling**

   - Handle missing templates
   - Handle missing appointment types
   - Handle invalid data
   - Handle API failures

10. **Edge Cases**
    - Empty contact lists
    - Contacts without labels
    - Contacts without phone numbers
    - Invalid date formats
    - Missing template variables

## Evaluation Criteria

### Part 1: Test Comprehensiveness

For each test file, analyze:

1. **Feature Coverage Matrix**

   Create a matrix mapping features to tests:

   | Feature   | Tested? | Test Location               | Coverage Quality     |
   | --------- | ------- | --------------------------- | -------------------- |
   | Feature A | ✅/❌   | `describe block - it block` | Full/Partial/Missing |

   For each feature:

   - Is the happy path tested?
   - Are error cases tested?
   - Are edge cases tested?
   - Are boundary conditions tested?

2. **Missing Test Coverage**

   Identify features/parts that are NOT tested:

   - Which features have zero tests?
   - Which features have only happy path tests?
   - Which error scenarios are untested?
   - Which edge cases are missing?
   - Which user interactions are untested?

3. **Integration vs Unit Test Balance**

   - Are components tested in isolation appropriately?
   - Are integration scenarios covered?
   - Are utility functions tested independently?
   - Are component interactions tested?

4. **Data Flow Testing**
   - Is data fetching tested?
   - Is data transformation tested?
   - Is data display tested?
   - Is user input handling tested?

### Part 2: Test Usefulness

For each test case, evaluate:

1. **Value Assessment**

   Rate each test on usefulness (High/Medium/Low/Redundant):

   - **High**: Tests critical business logic, catches real bugs, validates user workflows
   - **Medium**: Tests important functionality but could be broader
   - **Low**: Tests trivial functionality, doesn't add much value
   - **Redundant**: Duplicates coverage from other tests without adding value

2. **Actionability**

   - Does the test provide clear failure messages?
   - Would a failing test clearly indicate what's broken?
   - Does the test name clearly describe what's being validated?

3. **Maintenance Cost vs Value**

   - Is the test brittle (likely to break with minor changes)?
   - Does it test implementation details instead of behavior?
   - Is it easy to understand what the test validates?

4. **Specific Recommendations**

   For each test deemed not useful:

   - Should it be deleted? Why?
   - Should it be combined with another test?
   - Should it be expanded to be more comprehensive?
   - Should it be rewritten to test behavior instead of implementation?

### Part 3: Code Smells & Test Quality Issues

Identify and explain issues that could lead to:

#### 0. Duplicate Test Detection (NEW)

**Critical Issue - Check First:**

- Are there identical or near-identical test cases within the same file?
- Are there tests with the same name or description testing the same behavior?
- Are test assertions duplicated across multiple `it()` blocks?

**Example of problem to catch:**

```typescript
// BAD - Duplicate tests
it("returns 'multiple-types' when subjects have different types", () => {
  /* test A */
});
it("returns 'multiple-types' when subjects have different types", () => {
  /* identical test B */
});
```

**Action:** Flag all duplicate tests and recommend deletion of redundant ones.

#### A. False Positives (Tests pass when they shouldn't)

1. **Over-mocking Issues**

   - Are implementation details being mocked instead of behavior?
   - Are mocks returning data that doesn't match real data structures?
   - Are critical dependencies completely mocked out?
   - Example: Mocking a template loader but never testing real template content

2. **Weak Assertions**

   - Are assertions too generic? (e.g., `expect(result).toBeDefined()`)
   - Are assertions checking the wrong thing?
   - Are assertions missing entirely?
   - Example: Testing that a function was called but not what it returned

3. **Test Data Issues**

   - Is test data too simple compared to real data?
   - Does test data skip required fields?
   - Does test data not represent edge cases?
   - Example: Using minimal contact objects without realistic fields

4. **Missing Assertions**

   - Are side effects not being verified?
   - Are async operations not properly awaited?
   - Are state changes not being checked?
   - Example: Clicking a button but not checking if state changed

5. **Timing Issues**
   - Are race conditions possible?
   - Are async operations properly waited for?
   - Are timeouts too short or missing?

#### B. False Negatives (Tests fail when they shouldn't)

1. **Brittle Selectors**

   - Are tests using fragile CSS selectors?
   - Are tests dependent on text that might change?
   - Are tests coupled to specific DOM structure?
   - Example: `screen.getByText('exact string')` instead of regex

2. **Implementation Coupling**

   - Are tests checking internal state instead of behavior?
   - Are tests dependent on component internals?
   - Are tests breaking when implementation changes but behavior stays same?
   - Example: Testing that a specific function is called instead of testing the result

3. **Environment Dependencies**

   - Are tests dependent on specific environment setup?
   - Are tests using hardcoded dates/times?
   - Are tests dependent on test execution order?
   - Example: Using `new Date()` without mocking

4. **Mock Synchronization**
   - Are mocks out of sync with actual implementations?
   - Are mock return values outdated?
   - Are mock function signatures different from real functions?
   - Example: Mock returns different shape than real API

#### C. React Testing Library Specific Issues (NEW)

Since this codebase uses React Testing Library, evaluate:

1. **Query Priority**

   - Are tests using `getByRole` first (most accessible)?
   - Are tests falling back to `getByText` with exact strings instead of regex?
   - Are tests using `getByTestId` as a last resort?
   - Example: Using `screen.getByText('exact string')` instead of `/string/i` regex

2. **User Event Patterns**

   - Is `userEvent.setup()` used correctly?
   - Are interactions using `userEvent` instead of `fireEvent` where possible?
   - Are async actions properly awaited?
   - Example: `await user.click(button)` vs `fireEvent.click(button)`

3. **Accessibility Testing**

   - Are components tested for accessibility attributes?
   - Are labels properly associated with inputs?
   - Are buttons using proper `name` attributes?
   - Example: Testing `screen.getByRole('button', { name: /submit/i })`

4. **Component Rendering**
   - Are components rendered with necessary providers/contexts?
   - Are props properly typed in tests?
   - Are mocks set up before rendering?

#### D. Test Data Factory Consistency (NEW)

Evaluate test data creation patterns:

1. **Factory Function Consistency**

   - Are factory functions used consistently across test files?
   - Do factories create realistic test data?
   - Are default values sensible and overridable?
   - Example: `createInterviewContact("John", { id: "1", name: "Bishop" })`

2. **Test Data Realism**

   - Does test data match production data structures?
   - Are all required fields present?
   - Are optional fields handled correctly?
   - Are dates/times realistic and not edge cases by default?

3. **Factory Location**
   - Are factories defined at the top of test files?
   - Are they shared via test utilities when appropriate?
   - Are they easy to find and modify?

#### E. Mock Strategy Evaluation (NEW)

Evaluate mocking patterns:

1. **Mock Appropriateness**

   - Are external dependencies (API calls, file system) mocked?
   - Are internal utilities mocked unnecessarily?
   - Are mocks returning realistic data shapes?
   - Example: Mocking `@/utils/template-loader` is appropriate

2. **Mock Scope**

   - Are mocks defined at the right level (file vs describe vs test)?
   - Are mocks properly restored/cleared between tests?
   - Are mock implementations realistic?

3. **Mock Verification**
   - Are mocks asserting on call arguments, not just call count?
   - Are mock return values actually used in assertions?
   - Are error cases tested with mocks?

#### F. General Test Smells

1. **Test Organization**

   - Are tests properly grouped in describe blocks?
   - Are test names clear and descriptive?
   - Is there duplication across test files?
   - Are helper functions reused or duplicated?

2. **Test Independence**

   - Do tests share state?
   - Can tests run in any order?
   - Do tests clean up after themselves?
   - Are beforeEach/afterEach used correctly?

3. **Test Size/Complexity**

   - Are individual tests too large?
   - Do tests try to verify too many things?
   - Are tests hard to understand?
   - Example: A single test with 20 assertions

4. **Magic Values**

   - Are there unexplained constants?
   - Are test data creation functions unclear?
   - Are mock values unexplained?
   - Example: `expect(result).toBe(42)` without explanation

5. **Incomplete Testing**
   - Are only happy paths tested?
   - Are error cases missing?
   - Are boundary conditions untested?
   - Are accessibility concerns ignored?

## Output Format

### Executive Summary

Provide a 3-5 sentence summary of overall test quality.

### Detailed Findings

#### 1. Test Comprehensiveness Report

**Overall Coverage Score:** [X/10]

**Coverage by Area:**

- Data Fetching: [X%]
- Contact Display: [X%]
- Template Management: [X%]
- User Interactions: [X%]
- Message Generation: [X%]
- Error Handling: [X%]
- Edge Cases: [X%]

**Critical Missing Tests:**

- [List features with zero or minimal coverage]

**Partially Covered Features:**

- [List features that need more comprehensive testing]

#### 2. Test Usefulness Report

**High Value Tests:**

- [List tests that provide significant value]

**Medium Value Tests:**

- [List tests that could be improved]

**Low Value Tests:**

- [List tests that provide minimal value]

**Redundant Tests:**

- [List tests that should be removed or consolidated]

**Recommendations:**

- [Specific actionable recommendations for improving test value]

#### 3. Code Smells & Quality Issues

**Duplicate Tests (Critical - Check First):**

For each duplicate:

- **File:** [filename]
- **Duplicate Lines:** [line numbers of identical tests]
- **Description:** [What is duplicated]
- **Action:** [Which to keep/delete]
- **Severity:** High (reduces maintainability)

**False Positive Risks:**

For each issue:

- **File:** [filename:line]
- **Issue Type:** [Over-mocking/Weak Assertion/etc]
- **Description:** [What's wrong]
- **Risk:** [Why this could cause false positives]
- **Fix:** [How to fix it]
- **Severity:** [High/Medium/Low]

**False Negative Risks:**

For each issue:

- **File:** [filename:line]
- **Issue Type:** [Brittle Selector/Implementation Coupling/etc]
- **Description:** [What's wrong]
- **Risk:** [Why this could cause false negatives]
- **Fix:** [How to fix it]
- **Severity:** [High/Medium/Low]

**React Testing Library Issues:**

For each issue:

- **File:** [filename:line]
- **Issue Type:** [Query Priority/User Event/etc]
- **Description:** [What's wrong]
- **Best Practice:** [What should be used instead]
- **Severity:** [High/Medium/Low]

**Test Data Factory Issues:**

For each issue:

- **File:** [filename]
- **Issue:** [Inconsistent factories/Unrealistic data/etc]
- **Impact:** [How it affects test reliability]
- **Fix:** [How to improve factories]

**Mock Strategy Issues:**

For each issue:

- **File:** [filename]
- **Issue:** [Over-mocking/Under-mocking/etc]
- **Impact:** [How it affects test validity]
- **Fix:** [How to improve mocks]

**General Quality Issues:**

For each issue:

- **File:** [filename:line]
- **Issue:** [Description]
- **Impact:** [How it affects test quality]
- **Fix:** [How to fix it]

### Prioritized Action Items

#### Critical (Fix Immediately)

- [Issues that could mask real bugs or cause CI failures]

#### High Priority (Fix Soon)

- [Important issues affecting test reliability]

#### Medium Priority (Improve When Possible)

- [Issues affecting test maintainability]

#### Low Priority (Nice to Have)

- [Minor improvements]

### Example Good Tests

Provide 2-3 examples of well-written tests from the codebase that others should emulate.

### Recommended New Tests

List specific tests that should be added:

1. Test for [feature] - because [reason]
2. Test for [edge case] - because [reason]
3. Test for [error scenario] - because [reason]

## Instructions for AI Agent

1. **Read all test files** listed above
2. **CRITICAL FIRST STEP: Check for duplicate tests** - Scan each file for identical test cases with same names/descriptions
3. **Read the source files** being tested to understand what should be tested
4. **Analyze each test file** against the evaluation criteria
5. **Create the feature coverage matrix** by comparing tests to features
6. **Identify missing coverage** for critical functionality
7. **Evaluate test usefulness** with specific recommendations
8. **Find code smells** that could lead to false positives/negatives
9. **Evaluate React Testing Library patterns** - Query usage, userEvent, accessibility
10. **Assess test data factories** - Consistency, realism, reusability
11. **Review mock strategies** - Appropriateness, scope, verification
12. **Prioritize findings** by impact and severity
13. **Provide actionable recommendations** with specific examples

## Success Criteria

A successful evaluation will:

- **Check for duplicate tests FIRST** - Identify any identical test cases that should be removed
- Identify at least 3 critical gaps in test coverage
- Find at least 5 code smells that could lead to false results
- Evaluate React Testing Library query patterns and user event usage
- Assess test data factory consistency across files
- Review mock strategy appropriateness
- Provide specific, actionable recommendations for each issue
- Include code examples showing how to fix issues
- Prioritize improvements by impact
- Be comprehensive yet concise

## Specific Checks to Perform (NEW)

Before generating output, verify:

1. **No duplicate test cases** - Scan for identical `it()` blocks within each file
2. **Consistent factory functions** - Check if data creators follow same patterns
3. **RTL best practices** - Verify proper query priority and userEvent usage
4. **Mock realism** - Ensure mocked data matches real data structures
5. **Assertion specificity** - Check for weak assertions like `.toBeDefined()`
6. **Async handling** - Verify all async operations are properly awaited
7. **Test independence** - Ensure tests don't share state or depend on order

## Notes

- Focus on behavior testing over implementation details
- Consider the real-world usage of this application
- Think about what would happen if tests passed but the app was broken
- Think about what would happen if tests failed but the app was working correctly
- Consider accessibility, performance, and security where relevant
- Remember this is a church application used by executive secretaries

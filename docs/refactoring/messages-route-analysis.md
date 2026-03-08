# Refactoring Analysis: `/messages` Route

## Overview

This document provides a comprehensive refactoring analysis for the `/messages` route in the Next.js 13 application. The analysis focuses on code cleanliness, readability, modularity, extensibility, and maintainability.

---

## File-by-File Analysis

### 1. `/src/app/messages/page.tsx` (24 lines)

**Issues Found:**

#### Code Cleanliness

- **Line 162-168**: Duplicate empty state check (exact same code twice)

#### Readability

- **Line 9**: Comment "Apply ordering server-side..." is unnecessary - code is self-documenting

#### Extensibility

- **Line 7**: No error handling for `getAppointmentContacts()` failure
- Missing loading state beyond Suspense fallback

#### Maintainability

- No error boundary for data fetching failures

---

### 2. `/src/components/ContactList.tsx` (235 lines)

**Issues Found:**

#### Code Cleanliness - HIGH PRIORITY

- **Line 162-168**: Duplicate empty state check (exact duplicate)
- **Line 21-100**: `autoSelectTemplate` function is 80 lines - should be extracted to utils
- Magic strings throughout: "extend-calling", "setting-apart", "temple-visit", etc.

#### Modularity - HIGH PRIORITY

- **Line 21-100**: Template selection logic should be in `utils/template-matcher.ts`
- **Line 149**: Magic number for ID generation: `Math.random().toString(36).slice(2, 11)`

#### Readability

- **Line 106-121**: `listItems` construction could use Rambdax for functional approach
- Deeply nested template matching logic (lines 31-97)

#### Maintainability

- Hard-coded template ID strings make future changes difficult

---

### 3. `/src/components/ContactRow.tsx` (158 lines)

**Issues Found:**

#### Readability - MEDIUM PRIORITY

- **Line 30-158**: Component is well-structured but complex template preview logic (86-99) could be extracted
- **Line 93**: Magic logic: `isSunday(startOfTomorrow()) ? "tomorrow" : "Sunday"` - confusing

#### Modularity

- **Line 86-99**: Template preview generation could be custom hook `useTemplatePreview`
- **Line 93**: Date logic should be in utility function

#### Maintainability

- **Line 93**: Business logic mixed with presentation (date formatting, template substitution)

---

### 4. `/src/components/GroupCard.tsx` (314 lines)

**Issues Found:**

#### Code Cleanliness - HIGH PRIORITY

- **Line 28**: Magic number `INITIAL_MEMBER_ID = -1` - should be constant
- **Line 123**: Fallback object creation repeated pattern

#### Modularity - HIGH PRIORITY

- **Line 30-314**: Component is too large (314 lines) - violates single responsibility
- **Line 138-168**: Recipient handlers should be custom hook `useGroupRecipients`
- **Line 170-180**: Subject toggling should be custom hook `useGroupSubjects`
- **Line 107-136**: Preview generation should be extracted

#### Readability - MEDIUM PRIORITY

- **Line 89-105**: `canShowPreview` logic is complex - should be named function
- **Line 112-119**: Appointment types map building could use Rambdax

#### Extensibility

- **Line 139**: Hard-coded limit of 2 recipients

---

### 5. `/src/requests/cards/index.ts` (37 lines)

**Issues Found:**

#### Maintainability - HIGH PRIORITY

- **Line 11, 23, 27**: Magic Trello list IDs should be in constants
- **Line 33-36**: No error handling for `matchContact` failure
- No validation that contacts array is non-empty

#### Extensibility

- Hard-coded list IDs make environment changes difficult

---

### 6. `/src/requests/cards/requests.ts` (116 lines)

**Issues Found:**

#### Code Cleanliness - MEDIUM PRIORITY

- **Line 30**: Console.error should use proper logging
- **Line 51, 52, 109, 110, 114**: Multiple `@ts-expect-error` comments - indicates type issues

#### Maintainability - HIGH PRIORITY

- **Line 22-26**: API URL construction with template literals - should use URL builder
- **Line 96-101**: Hard-coded board list IDs duplicated from index.ts

#### Security

- **Line 22-26**: API key/token exposed in URL (though from env vars)

---

### 7. `/src/utils/contact-ordering.ts` (68 lines)

**Issues Found:**

#### Code Cleanliness

- **Line 3-10**: Unused `LABEL_PRIORITY` constant (defined but never used)
- **Line 4-5**: Comments are redundant with function names

#### Maintainability

- **Line 66**: Using `indexOf` in sort could be O(n²) - should use Map for O(1) lookup

---

### 8. `/src/utils/template-loader.ts` (70 lines)

**Issues Found:**

#### Code Cleanliness - MEDIUM PRIORITY

- **Line 70**: Comment "include your autoSelectTemplate..." - appears to be leftover TODO

#### Maintainability

- **Line 8**: Using `(require as any).context` - type safety issue
- **Line 8-12**: Webpack-specific API - may not work with other bundlers

---

## Priority Rankings

### HIGH PRIORITY (Immediate Impact)

1. **Extract template auto-selection logic** (`ContactList.tsx:21-100`)

   - 80-line function violates SRP
   - Hard to test in isolation
   - Template matching logic scattered

2. **Remove duplicate empty state check** (`ContactList.tsx:162-168`)

3. **Extract constants for magic IDs**

   - Trello list IDs in `cards/index.ts` and `cards/requests.ts`
   - `INITIAL_MEMBER_ID` in `GroupCard.tsx`

4. **Break down GroupCard component** (314 lines → multiple components/hooks)

5. **Add error handling for data fetching**
   - `page.tsx:7` - no error handling
   - `cards/index.ts:33-36` - matchContact failures

### MEDIUM PRIORITY (Significant Improvement)

6. **Extract template preview logic** from `ContactRow.tsx` to custom hook

7. **Replace console.error with proper logging** (`cards/requests.ts:30`)

8. **Improve type safety** - fix `@ts-expect-error` comments in `requests.ts`

9. **Extract date formatting logic** from `ContactRow.tsx:93`

10. **Remove unused `LABEL_PRIORITY` constant** (`contact-ordering.ts:3-10`)

### LOW PRIORITY (Nice to Have)

11. **Optimize sorting performance** (`contact-ordering.ts:66`)

12. **Add loading states** beyond basic Suspense

13. **Improve webpack require typing** (`template-loader.ts:8`)

---

## Specific Refactors

### 1. Extract Template Auto-Selection Logic

**Current Code** (`ContactList.tsx:21-100`):

```typescript
function autoSelectTemplate(
  contact: Contact,
  messageTypes: MessageType[],
): string | undefined {
  if (contact.kind === "calling") {
    return contact.stage === CallingStage.needsCallingExtended
      ? "extend-calling"
      : "setting-apart";
  }

  if (contact.kind === "interview" && contact.labels?.name) {
    const labelName = contact.labels.name.toLowerCase();
    // ... 60+ lines of template matching
  }
}
```

**Suggested Refactor**:

Create `/src/utils/template-matcher.ts`:

```typescript
import { Contact, MessageType } from "@/types/messages";
import { CallingStage } from "@/constants";

const TEMPLATE_MATCHERS: Array<{
  matcher: (labelName: string) => boolean;
  templateId: string;
}> = [
  { matcher: (label) => label.includes("temple"), templateId: "temple-visit" },
  {
    matcher: (label) => label.includes("welfare"),
    templateId: "welfare-meeting",
  },
  {
    matcher: (label) => label.includes("family"),
    templateId: "family-council",
  },
  {
    matcher: (label) => label.includes("bishop"),
    templateId: "bishop-interview",
  },
  {
    matcher: (label) => label.includes("first counselor"),
    templateId: "first-counselor-interview",
  },
  {
    matcher: (label) => label.includes("second counselor"),
    templateId: "second-counselor-interview",
  },
  {
    matcher: (label) => label.includes("setting apart"),
    templateId: "setting-apart",
  },
  { matcher: (label) => label.includes("follow"), templateId: "follow-up" },
];

export function autoSelectTemplate(
  contact: Contact,
  messageTypes: MessageType[],
): string | undefined {
  if (contact.kind === "calling") {
    return contact.stage === CallingStage.needsCallingExtended
      ? "extend-calling"
      : "setting-apart";
  }

  if (contact.kind === "interview" && contact.labels?.name) {
    const labelName = contact.labels.name.toLowerCase();

    const exactMatch = messageTypes.find(
      (mt) => mt.id === labelName.replace(/\s+/g, "-"),
    );
    if (exactMatch) return exactMatch.id;

    for (const { matcher, templateId } of TEMPLATE_MATCHERS) {
      const template = messageTypes.find((mt) => mt.id === templateId);
      if (template && matcher(labelName)) {
        return templateId;
      }
    }

    const defaultTemplate = messageTypes.find(
      (mt) => mt.id === "interview-reminder",
    );
    return defaultTemplate?.id;
  }

  return undefined;
}
```

**Why it improves the code**:

- Reduces `ContactList.tsx` from 235 to ~150 lines
- Template matching logic is testable in isolation
- Easy to add new template matchers without touching component
- Follows configuration-over-code principle
- Aligns with Rambdax functional patterns

---

### 2. Remove Duplicate Empty State Check

**Current Code** (`ContactList.tsx:162-168`):

```typescript
if (!contacts || contacts.length === 0) {
  return <p className="text-slate-900 italic">No contacts to display</p>;
}

if (!contacts || contacts.length === 0) {
  return <p className="text-slate-900 italic">No contacts to display</p>;
}
```

**Suggested Refactor**:

```typescript
if (!contacts || contacts.length === 0) {
  return <p className="text-slate-900 italic">No contacts to display</p>;
}
```

**Why it improves the code**:

- Eliminates dead code
- Prevents confusion about which check executes
- Cleaner, more maintainable

---

### 3. Extract Constants for Magic IDs

**Current Code** (scattered across files):

```typescript
// cards/index.ts:11
const APPOINTMENT_INTERVIEW_LIST_IDS: string[] = ["698142f18c51336104b0ca17"];

// cards/index.ts:23
("69814029755d3899bbf4191c");

// cards/index.ts:27
("5f62bc2052e58c7dc5740b4f");

// GroupCard.tsx:28
const INITIAL_MEMBER_ID = -1;
```

**Suggested Refactor**:

Add to `/src/constants.ts`:

```typescript
// Trello List IDs for Appointment Messaging
export const TRELLO_LIST_IDS = {
  APPOINTMENT_INTERVIEWS: ["698142f18c51336104b0ca17"],
  CALLINGS_NEEDS_EXTENSION: "69814029755d3899bbf4191c",
  CALLINGS_NEEDS_SETTING_APART: "5f62bc2052e58c7dc5740b4f",
  INTERVIEW_BOARD: ["698142f18c51336104b0ca18"],
  CALLINGS_BOARD: ["6981402b631c5d579084983f"],
  SETTING_APART_BOARD: ["6981403b91ce00795685a559", "5f62bc2052e58c7dc5740b4f"],
} as const;

// Member selection constants
export const MEMBER_SELECTION = {
  INITIAL_MEMBER_ID: -1,
  MAX_RECIPIENTS: 2,
} as const;
```

**Why it improves the code**:

- Single source of truth for configuration
- Easy to change environment-specific values
- Self-documenting with descriptive names
- Type-safe with `as const`

---

### 4. Break Down GroupCard Component

**Current Code** (314 lines in single component)

**Suggested Refactor**:

Create `/src/hooks/useGroupRecipients.ts`:

```typescript
import { useState, useMemo } from "react";
import { Contact } from "@/types/messages";
import { MEMBER_SELECTION } from "@/constants";
import members from "@/data/members.json";
import { Member } from "@/utils/format-member-display";

const memberData = members as Member[];

export function useGroupRecipients(groupContacts: Contact[]) {
  const [recipientsAreSubjects, setRecipientsAreSubjects] = useState(false);
  const [selectedRecipientMemberIds, setSelectedRecipientMemberIds] = useState<
    number[]
  >([MEMBER_SELECTION.INITIAL_MEMBER_ID]);

  const selectedRecipients = useMemo(() => {
    if (recipientsAreSubjects) {
      return groupContacts;
    }
    return memberData
      .filter((m) => selectedRecipientMemberIds.includes(m.id))
      .map((m) => {
        const contact = groupContacts.find((c) => c.name === m.name);
        return contact || ({ name: m.name, kind: "interview" } as Contact);
      });
  }, [recipientsAreSubjects, selectedRecipientMemberIds, groupContacts]);

  const recipientPhoneNumbers = useMemo(() => {
    if (recipientsAreSubjects) {
      return selectedRecipients
        .map((r) => ("phone" in r ? r.phone : undefined))
        .filter((p): p is string => !!p);
    }
    return memberData
      .filter((m) => selectedRecipientMemberIds.includes(m.id))
      .map((m) => m.phone)
      .filter((p): p is string => !!p);
  }, [recipientsAreSubjects, selectedRecipients, selectedRecipientMemberIds]);

  const handleAddRecipient = () => {
    if (selectedRecipientMemberIds.length < MEMBER_SELECTION.MAX_RECIPIENTS) {
      setSelectedRecipientMemberIds([
        ...selectedRecipientMemberIds,
        MEMBER_SELECTION.INITIAL_MEMBER_ID,
      ]);
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setSelectedRecipientMemberIds(
      selectedRecipientMemberIds.filter((_, i) => i !== index),
    );
  };

  const handleChangeRecipient = (
    index: number,
    memberId: number | undefined,
  ) => {
    if (memberId === undefined) {
      setSelectedRecipientMemberIds(
        selectedRecipientMemberIds.filter((_, i) => i !== index),
      );
    } else {
      setSelectedRecipientMemberIds(
        selectedRecipientMemberIds.map((id, i) =>
          i === index ? memberId : id,
        ),
      );
    }
  };

  const handleRecipientsAreSubjectsChange = (checked: boolean) => {
    setRecipientsAreSubjects(checked);
    if (checked) {
      setSelectedRecipientMemberIds([MEMBER_SELECTION.INITIAL_MEMBER_ID]);
    }
  };

  return {
    recipientsAreSubjects,
    selectedRecipientMemberIds,
    selectedRecipients,
    recipientPhoneNumbers,
    handleAddRecipient,
    handleRemoveRecipient,
    handleChangeRecipient,
    handleRecipientsAreSubjectsChange,
  };
}
```

Create `/src/hooks/useGroupSubjects.ts`:

```typescript
import { useState, useMemo } from "react";
import { Contact } from "@/types/messages";

export function useGroupSubjects() {
  const [subjects, setSubjects] = useState<Contact[]>([]);
  const [subjectTemplateMap, setSubjectTemplateMap] = useState<
    Record<string, string>
  >({});

  const toggleSubject = (contact: Contact) => {
    const isSubject = subjects.some((s) => s.name === contact.name);
    if (isSubject) {
      setSubjects(subjects.filter((s) => s.name !== contact.name));
      const newMap = { ...subjectTemplateMap };
      delete newMap[contact.name];
      setSubjectTemplateMap(newMap);
    } else {
      setSubjects([...subjects, contact]);
    }
  };

  const setTemplateForSubject = (contactName: string, templateId: string) => {
    setSubjectTemplateMap({
      ...subjectTemplateMap,
      [contactName]: templateId,
    });
  };

  const canShowPreview = useMemo(() => {
    const hasSubjects = subjects.length > 0;
    const allTemplatesSelected =
      Object.keys(subjectTemplateMap).length === subjects.length;
    return hasSubjects && allTemplatesSelected;
  }, [subjects, subjectTemplateMap]);

  return {
    subjects,
    subjectTemplateMap,
    toggleSubject,
    setTemplateForSubject,
    canShowPreview,
  };
}
```

**Why it improves the code**:

- Reduces `GroupCard.tsx` from 314 to ~150 lines
- Logic is testable in isolation
- Follows React hooks best practices
- Easier to reason about each concern
- Reusable if needed elsewhere

---

### 5. Add Error Handling for Data Fetching

**Current Code** (`page.tsx:6-10`):

```typescript
export default async function MessagesPage() {
  const contacts = await getAppointmentContacts();
  const sortedContacts = sortContactsByLabel(contacts);
  // ...
}
```

**Suggested Refactor**:

```typescript
export default async function MessagesPage() {
  let contacts;
  try {
    contacts = await getAppointmentContacts();
  } catch (error) {
    console.error("Failed to fetch appointment contacts:", error);
    return (
      <main className="p-2 md:p-24 flex flex-col space-y-10 overflow-x-hidden">
        <h1 className="text-3xl font-bold leading-none tracking-tight text-gray-900">
          Appointment Messages
        </h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
          <p className="font-semibold">Error Loading Contacts</p>
          <p className="text-sm mt-1">Unable to load appointment contacts. Please try again later.</p>
        </div>
      </main>
    );
  }

  const sortedContacts = sortContactsByLabel(contacts);
  // ...
}
```

**Why it improves the code**:

- Prevents unhandled promise rejections
- Provides user-friendly error feedback
- Follows error boundary patterns
- Easier debugging with specific error message

---

### 6. Extract Template Preview Logic to Custom Hook

**Current Code** (`ContactRow.tsx:86-99`):

```typescript
const templatePreview = selectedTemplateId
  ? substituteTemplate(loadTemplateContent(selectedTemplateId), {
      name: nameVariable,
      appointmentType:
        contact.kind === "calling" ? contact.calling : contact.labels?.name,
      date: isSunday(startOfTomorrow()) ? "tomorrow" : "Sunday",
      "before-or-after-church": beforeOrAfterChurch,
      time: format(parse(selectedTime, "HH:mm", new Date()), "h:mm a"),
    })
  : "";
```

**Suggested Refactor**:

Create `/src/hooks/useTemplatePreview.ts`:

```typescript
import { useMemo } from "react";
import { Contact } from "@/types/messages";
import { loadTemplateContent } from "@/utils/template-loader";
import { substituteTemplate } from "@/utils/template-substitution";
import { getBeforeOrAfterChurch } from "@/utils/time-utils";
import { format, isSunday, parse, startOfTomorrow } from "date-fns";

interface UseTemplatePreviewOptions {
  selectedTemplateId?: string;
  selectedTime: string;
  nameVariable: string;
  contact: Contact;
}

export function useTemplatePreview({
  selectedTemplateId,
  selectedTime,
  nameVariable,
  contact,
}: UseTemplatePreviewOptions) {
  return useMemo(() => {
    if (!selectedTemplateId) {
      return "";
    }

    const beforeOrAfterChurch = getBeforeOrAfterChurch(selectedTime);

    return substituteTemplate(loadTemplateContent(selectedTemplateId), {
      name: nameVariable,
      appointmentType:
        contact.kind === "calling" ? contact.calling : contact.labels?.name,
      date: isSunday(startOfTomorrow()) ? "tomorrow" : "Sunday",
      "before-or-after-church": beforeOrAfterChurch,
      time: format(parse(selectedTime, "HH:mm", new Date()), "h:mm a"),
    });
  }, [selectedTemplateId, selectedTime, nameVariable, contact]);
}
```

**Why it improves the code**:

- Separates business logic from presentation
- Reusable across components
- Easier to test
- Cleaner component code
- Memoized automatically

---

## Cross-Cutting Concerns

### 1. Template ID Management

**Issue**: Template IDs are magic strings scattered across multiple files

**Files Affected**:

- `ContactList.tsx`
- `ContactRow.tsx`
- `GroupCard.tsx`
- `template-loader.ts`

**Solution**: Create `/src/constants/templates.ts`:

```typescript
export const TEMPLATE_IDS = {
  EXTEND_CALLING: "extend-calling",
  SETTING_APART: "setting-apart",
  INTERVIEW_REMINDER: "interview-reminder",
  TEMPLE_VISIT: "temple-visit",
  WELFARE_MEETING: "welfare-meeting",
  FAMILY_COUNCIL: "family-council",
  BISHOP_INTERVIEW: "bishop-interview",
  FIRST_COUNSELOR_INTERVIEW: "first-counselor-interview",
  SECOND_COUNSELOR_INTERVIEW: "second-counselor-interview",
  FOLLOW_UP: "follow-up",
} as const;
```

### 2. Date/Time Formatting Consistency

**Issue**: Date formatting logic duplicated and inconsistent

**Files Affected**:

- `ContactRow.tsx:93`
- Multiple components likely have similar logic

**Solution**: Create `/src/utils/date-formatters.ts`:

```typescript
import { format, isSunday, parse, startOfTomorrow } from "date-fns";

export function formatAppointmentDate(): string {
  return isSunday(startOfTomorrow()) ? "tomorrow" : "Sunday";
}

export function formatTimeForDisplay(time24: string): string {
  return format(parse(time24, "HH:mm", new Date()), "h:mm a");
}
```

### 3. Error Handling Strategy

**Issue**: Inconsistent error handling across API calls

**Files Affected**:

- `page.tsx`
- `cards/index.ts`
- `cards/requests.ts`

**Solution**: Create error boundary wrapper and consistent error types

---

## Quick Wins (High Impact, Low Effort)

1. **Remove duplicate empty state check** (2 minutes)

   - Delete lines 166-168 in `ContactList.tsx`

2. **Remove unused LABEL_PRIORITY constant** (1 minute)

   - Delete lines 3-10 in `contact-ordering.ts`

3. **Remove leftover TODO comment** (1 minute)

   - Delete line 70 in `template-loader.ts`

4. **Extract INITIAL_MEMBER_ID to constants** (5 minutes)

   - Add to `constants.ts`, update `GroupCard.tsx`

5. **Extract Trello list IDs to constants** (10 minutes)

   - Add to `constants.ts`, update `cards/index.ts` and `cards/requests.ts`

6. **Replace console.error with proper logging** (3 minutes)

   - Line 30 in `cards/requests.ts`

7. **Add error handling to page.tsx** (10 minutes)
   - Wrap `getAppointmentContacts()` in try-catch

---

## Breaking Changes

The following refactors could introduce breaking changes and should be tested carefully:

1. **Extracting template IDs to constants** - Ensure all references are updated
2. **Breaking down GroupCard** - Component API may change if used elsewhere
3. **Error handling additions** - May affect error flow if errors are expected to bubble up

---

## Summary

This route has **solid foundations** but would benefit from:

1. **Extracting business logic** from components to utils/hooks
2. **Consolidating magic values** into constants
3. **Improving error handling** for robustness
4. **Reducing component complexity** for maintainability

**Estimated effort**:

- Quick wins: ~30 minutes
- High priority refactors: ~4-6 hours
- Full refactor: ~12-16 hours

**Biggest impact changes**:

1. Extract template matching logic
2. Break down GroupCard component
3. Consolidate constants
4. Add comprehensive error handling

---
phase: quick
plan: 5
type: execute
wave: 1
depends_on: []
files_modified: [src/components/ContactRow.tsx]
autonomous: true
requirements: []

must_haves:
  truths:
    - "Time picker only allows selection between 9am and 2pm"
    - "Time picker only allows 5-minute increments"
    - "Time picker validates input on change"
  artifacts:
    - path: "src/components/ContactRow.tsx"
      provides: "Time picker with 5-minute increments and 9am-2pm restriction"
      min_lines: 10
  key_links:
    - from: "input type=\"time\""
      to: "selectedTime state"
      via: "onChange handler with validation"
      pattern: "onChange=.*setSelectedTime"
---

<objective>
Update time picker in ContactRow.tsx to restrict hours between 9am-2pm and enforce 5-minute increments

Purpose: Ensure appointment times align with church secretary's available scheduling window
Output: Time input with step="300" (5-minute), min="09:00", max="14:00"
</objective>

<execution_context>
@/Users/kjc/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kjc/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/ContactRow.tsx
</context>

<tasks>

<task type="auto">
  <name>Update time picker constraints</name>
  <files>src/components/ContactRow.tsx</files>
  <action>
    On line 154, update the input element to:
    1. Change max="18:00" to max="14:00" (2pm in 24-hour format)
    2. Add step="300" attribute (5 minutes = 300 seconds)
    3. Update default state on line 24 from "12:30" to "12:00" (aligns with 5-minute increments)

    The browser's native time input will automatically:
    - Show only hours 09:00-14:00 in the picker UI
    - Snap to 5-minute intervals when selecting
    - Reject invalid values that fall outside these constraints
  </action>
  <verify>Open the messages page and verify the time picker dropdown shows only hours 9am-2pm in 5-minute increments</verify>
  <done>Time picker displays valid range (9am-2pm) and snaps to 5-minute intervals when selecting</done>
</task>

</tasks>

<verification>
- Time picker max attribute is "14:00"
- Time picker step attribute is "300"
- Default selectedTime is "12:00"
- Browser validation prevents selecting outside 9am-2pm range
- Browser validation snaps to 5-minute increments
</verification>

<success_criteria>
Time picker only accepts values between 09:00 and 14:00 in 5-minute increments
</success_criteria>

<output>
After completion, create `.planning/quick/5-update-time-picker-in-contactrow-tsx-to-/5-SUMMARY.md`
</output>

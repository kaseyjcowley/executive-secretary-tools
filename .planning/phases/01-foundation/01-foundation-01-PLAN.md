---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/utils/templates.ts
  - src/templates/messages/temple-visit.txt
  - src/templates/messages/interview-reminder.txt
  - src/templates/messages/calling-acceptance.txt
  - src/templates/messages/setting-apart.txt
  - src/templates/messages/bishop-interview.txt
  - src/templates/messages/first-counselor-interview.txt
  - src/templates/messages/second-counselor-interview.txt
  - src/templates/messages/welfare-meeting.txt
  - src/templates/messages/family-council.txt
  - src/templates/messages/follow-up.txt
autonomous: true

must_haves:
  truths:
    - Template files load from filesystem
    - Variables substitute correctly with rambdax.interpolate
    - Missing variables are replaced with empty string
    - Templates use {{variable}} syntax
  artifacts:
    - path: "src/utils/templates.ts"
      provides: "Template loading and substitution utilities"
      exports: ["loadTemplate", "substituteTemplate"]
      min_lines: 20
    - path: "src/templates/messages/"
      provides: "Message template files"
      contains: "temple-visit.txt"
  key_links:
    - from: "src/utils/templates.ts"
      to: "rambdax.interpolate"
      via: "import statement"
      pattern: "import.*interpolate.*from.*rambdax"
    - from: "src/utils/templates.ts"
      to: "src/templates/messages/"
      via: "fs.readFileSync"
      pattern: "fs\\.readFileSync"
---

<objective>
Create a filesystem-based template system with variable substitution using established codebase patterns.

Purpose: Foundation for message generation - templates provide consistent messaging format with customizable content.
Output: Template loader utility + 10 sample message templates.
</objective>

<execution_context>
@/Users/kjc/.claude/get-shit-done/workflows/execute-plan.md
@/Users/kjc/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation/01-RESEARCH.md

# Existing patterns to follow
@src/app/api/post-interviews-to-slack/route.ts
</context>

<tasks>

<task type="auto">
  <name>Create template loader utility</name>
  <files>src/utils/templates.ts</files>
  <action>Create src/utils/templates.ts with two exported functions:

1. loadTemplate(templateName: string): string
   - Use fs.readFileSync to read from src/templates/messages/{templateName}.txt
   - Follow pattern from src/app/api/post-interviews-to-slack/route.ts (lines 30-35)
   - Use path.join(process.cwd(), "src/templates/messages/", templateName)
   - Wrap in try-catch, throw Error with clear message on failure
   - Return template content as UTF-8 string

2. substituteTemplate(template: string, variables: Record<string, unknown>): string
   - Import interpolate from rambdax (already installed)
   - Call interpolate(template, variables)
   - Return result

DO NOT:
- Use async file reading (sync is simpler, matches existing pattern)
- Add any template engine (handlebars, mustache, ejs) - rambdax.interpolate handles {{variable}} syntax
- Create a template class or singleton - simple functions are sufficient
</action>
  <verify>Run: node -e "const {loadTemplate} = require('./src/utils/templates.ts'); console.log(typeof loadTemplate === 'function')" - should not throw (TypeScript file needs ts-node or check file exists)</verify>
  <done>src/utils/templates.ts exists with loadTemplate and substituteTemplate functions exported</done>
</task>

<task type="auto">
  <name>Create sample message templates</name>
  <files>
    src/templates/messages/temple-visit.txt
    src/templates/messages/interview-reminder.txt
    src/templates/messages/calling-acceptance.txt
    src/templates/messages/setting-apart.txt
    src/templates/messages/bishop-interview.txt
    src/templates/messages/first-counselor-interview.txt
    src/templates/messages/second-counselor-interview.txt
    src/templates/messages/welfare-meeting.txt
    src/templates/messages/family-council.txt
    src/templates/messages/follow-up.txt
  </files>
  <action>Create 10 template files in src/templates/messages/ directory:

For each template, use {{variable}} syntax with these available variables:
- {{name}} - Person's name
- {{phone}} - Phone number
- {{appointmentType}} - Type of appointment (e.g., "Temple Visit")
- {{date}} - Date of appointment
- {{time}} - Time of appointment
- {{location}} - Location (if applicable)

Template content examples (keep messages church-appropriate, brief):

1. temple-visit.txt:
"Hi {{name}}, you have a temple visit scheduled for {{date}} at {{time}}. Please arrive at the temple 10 minutes early. Text or call {{phone}} if you have questions."

2. interview-reminder.txt:
"Hi {{name}}, this is a reminder about your {{appointmentType}} on {{date}} at {{time}}. Looking forward to meeting with you!"

3. calling-acceptance.txt:
"Hi {{name}}, thank you for accepting the calling as {{appointmentType}}. We'll schedule a time to set you apart soon. Text {{phone}} if you have questions."

4. setting-apart.txt:
"Hi {{name}}, you're scheduled to be set apart from your calling on {{date}} at {{time}}. Please be at {{location}} 5 minutes before."

5. bishop-interview.txt:
"Hi {{name}}, you have an interview with the bishop on {{date}} at {{time}}. Text {{phone}} if you need to reschedule."

6. first-counselor-interview.txt:
"Hi {{name}}, you have an interview with the first counselor on {{date}} at {{time}}. Text {{phone}} if you need to reschedule."

7. second-counselor-interview.txt:
"Hi {{name}}, you have an interview with the second counselor on {{date}} at {{time}}. Text {{phone}} if you need to reschedule."

8. welfare-meeting.txt:
"Hi {{name}}, you have a welfare meeting scheduled for {{date}} at {{time}} at {{location}}. Text {{phone}} if you have questions."

9. family-council.txt:
"Hi {{name}}, you have a family council scheduled for {{date}} at {{time}}. Please bring your family. Text {{phone}} if you need to reschedule."

10. follow-up.txt:
"Hi {{name}}, following up on our {{appointmentType}} from {{date}}. How are things going? Text or call {{phone}} when you have a moment."

DO NOT:
- Add any special syntax beyond {{variable}} - rambdax.interpolate handles this
- Make templates longer than 160 characters (SMS limit awareness)
- Include emojis (keep messages professional)
</action>
  <verify>Run: ls src/templates/messages/ - should list 10 .txt files</verify>
  <done>All 10 template files exist in src/templates/messages/ directory with {{variable}} placeholders</done>
</task>

</tasks>

<verification>
Run these checks after completion:

1. Template file existence:
   ```bash
   ls -la src/templates/messages/
   ```
   Should show 10 .txt files

2. Template loader function exports:
   Check src/utils/templates.ts exports loadTemplate and substituteTemplate

3. Variable substitution test (manual or add test):
   The interpolate function should handle missing variables gracefully (replaces with empty string)
</verification>

<success_criteria>
- src/utils/templates.ts created with loadTemplate and substituteTemplate functions
- 10 message templates created in src/templates/messages/ directory
- All templates use {{variable}} syntax for variables
- Templates follow existing codebase patterns (fs.readFileSync, rambdax.interpolate)
- No external dependencies added beyond what's already installed
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-01-SUMMARY.md` with:
- What was built
- How templates are loaded
- How variable substitution works
- Any decisions made (e.g., variable naming convention)
</output>

# Phase 2: Contact Display & Template Selection - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

## Phase Boundary

Build a UI page that displays Trello contacts and lets users select message templates. Users can browse contacts and preview templates with actual contact data substituted. Actual message editing, scheduling, and approval are in later phases.

---

## Implementation Decisions

### Contact list layout
- List view (full width, compact rows)
- Each row shows: name, labels, and phone number
- No row selection (no checkboxes or click-to-select)
- Fixed height rows (not expandable)
- Show all contacts at once (no pagination or infinite scroll)
- Order: contacts with "calling" labels first, then "interview" labels, then others (any order after that)
- No filtering or search functionality
- Visual style: Claude's discretion

### Template selection
- Categorized dropdown (grouped by label/category)
- Template categories aligned with Trello labels (e.g., "temple recommend interview", "calling", etc.)
- Auto-select default template based on contact's labels when contact loads
- Label-to-template matching: uses explicit mapping object (LABEL_TO_TEMPLATE_MAP) that maps label names to template filenames
  - Example: "temple recommend interview" label → "temple-visit" template file
  - Case-insensitive label matching
  - Falls back to "interview-reminder" for unknown labels
- Show friendly names in dropdown (not raw label names)
- Dropdown always visible
- Per-contact selection: each contact row has its own template dropdown
- User can change the auto-selected template

### Template preview
- Position: Claude's discretion
- Always visible (no toggle to hide/show)
- Preview shows full message text with actual contact data substituted
- Full text displayed (no truncation)
- Preview updates when template selection changes (not live/real-time)
- No character count or SMS segment indicators
- Plain text display (no variable highlighting)
- Partial substitution for missing data: substitute available variables, leave missing variables as placeholders (e.g., "{{phone}}" if phone not available)

### Claude's Discretion
- Contact list row visual styling (spacing, colors, typography)
- Template preview positioning relative to template dropdown
- Exact spacing and layout details
- Empty state presentation (if no contacts exist)
- Error state presentation (if contact fetch fails)

---

## Specific Ideas

- Labels will match templates 1:1 for automatic selection
- Friendly names should be derived from template content or metadata
- Template preview should feel like a "what will the message look like?" view

---

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 02-contact-display-template-selection*
*Context gathered: 2026-02-15*

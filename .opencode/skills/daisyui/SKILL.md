---
name: daisyui
description: >
  Implement and maintain a consistent design system using DaisyUI and Tailwind CSS.
  Use this skill when building new components, refactoring pages, or adding new UI elements.
  Triggers on phrases like "add DaisyUI", "use DaisyUI component", "design system", 
  "build a button", "create a modal", "add a badge", or any request to create or 
  modify UI components.
---

# DaisyUI Design System

This project uses DaisyUI with Tailwind CSS for a consistent, themeable design system.

## Component Library

All reusable UI components are located in `src/components/ui/`. Import from the barrel file:

```typescript
import { Button, Card, Badge, Input, Modal } from "@/components/ui";
```

### Available Components

| Component  | Variants                                                          | Notes                                                       |
| ---------- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| `Button`   | primary, secondary, accent, ghost, danger, success, warning, info | Sizes: xs, sm, md, lg                                       |
| `Card`     | -                                                                 | Use `Card.Header`, `Card.Body`, `Card.Footer` subcomponents |
| `Badge`    | primary, secondary, accent, ghost, info, success, warning, error  | -                                                           |
| `Input`    | -                                                                 | Supports label, error, helperText                           |
| `Textarea` | -                                                                 | Supports label, error, helperText                           |
| `Select`   | -                                                                 | Supports label, error, helperText, options prop             |
| `Modal`    | -                                                                 | Controlled with isOpen/onClose props                        |
| `Alert`    | info, success, warning, error, neutral                            | Optional onClose for dismissible alerts                     |
| `Loading`  | -                                                                 | Spinner, Loading, LoadingPage variants                      |

## Authoring Rules

### 1. Use DaisyUI Base Classes

Always use DaisyUI semantic classes as the foundation. Example:

```typescript
// GOOD - Uses DaisyUI btn classes
<button className="btn btn-primary">Click me</button>

// BAD - Raw Tailwind that duplicates DaisyUI
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Click me</button>
```

### 2. Accept Variant Props

Components should accept variant and size props that map to DaisyUI modifier classes:

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
}

const variantClasses = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};
```

### 3. Use Semantic Color Tokens

Never hardcode colors. Use DaisyUI semantic tokens:

```typescript
// GOOD
className = "text-base-content bg-base-200 text-primary";

// BAD
className = "text-gray-900 bg-gray-100 text-blue-600";
```

### 4. Apply Theme at Root Only

Only apply `data-theme` at the root HTML element. Never apply themes at component level.

### 5. Forward className

Every component should accept and forward `className` for extensibility:

```typescript
interface Props {
  className?: string;
  // ...other props
}
```

### 6. Use useId for Generated IDs

When generating IDs for form elements, use React's `useId` hook instead of `Math.random()`:

```typescript
import { useId } from "react";

const generatedId = useId();
const inputId = id || generatedId;
```

## Configuration

DaisyUI is configured in `tailwind.config.ts`:

```typescript
plugins: [require("daisyui")],
daisyui: {
  themes: ["light", "dark"],
  darkTheme: "dark",
  defaultTheme: "light",
},
```

Set the theme on the HTML element in `src/app/layout.tsx`:

```tsx
<html lang="en" data-theme="light">
```

## Guardrails

- **Do not** mix DaisyUI component classes with Shadcn or other library classes
- **Do not** use arbitrary Tailwind values (e.g., `w-[347px]`) in shared components
- **Do not** create new components for things DaisyUI already handles - check the docs first
- **Do** use CSS spacing scale tokens only (e.g., `p-4`, `gap-2`)
- **Do** co-locate a brief JSDoc comment on each component describing its props

## Adding New Components

When adding a new DaisyUI-based component:

1. Create the component file in `src/components/ui/`
2. Export the variant/size types if applicable
3. Add the component to `src/components/ui/index.ts` barrel file
4. Follow the authoring rules above

## DaisyUI Documentation

For component reference, see the DaisyUI docs at https://daisyui.com/components/

Use Context7 MCP to fetch current DaisyUI documentation:

- Search for "DaisyUI button component"
- Search for "DaisyUI form inputs"
- Search for "DaisyUI modal dialog"

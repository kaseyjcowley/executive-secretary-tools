---
name: ts-audit
description: >
  Perform a comprehensive TypeScript code quality audit on a repository. Use this skill
  whenever the user wants to audit, review, or improve TypeScript quality in a project —
  including finding type unsafety, code smells, tsconfig weaknesses, or structural issues.
  Trigger on phrases like "TypeScript audit", "fix TS issues", "improve type safety",
  "clean up TypeScript", "find type casts", "review tsconfig", or any request to review,
  lint, or improve TypeScript code quality in a codebase. Also trigger when the user
  mentions specific TypeScript code smells like `as` casts, `any`, inline types, or
  missing return types.
---

# TypeScript Audit Skill

A structured, agentic guide for performing a comprehensive TypeScript audit on a repository.
The goal is to surface code smells, unsafe patterns, and configuration weaknesses — then
produce a prioritized, actionable remediation plan.

---

## Phase 0: Reconnaissance

Before running any analysis, understand the project shape.

```bash
# Project structure overview
find . -name "tsconfig*.json" | head -20
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v dist | wc -l
cat package.json | jq '{name, scripts, dependencies, devDependencies}'
```

Identify:
- Monorepo or single package? (look for `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `packages/`)
- Framework in use (Next.js, Expo, Express, etc.)
- TypeScript version
- Existing lint tooling (`eslint`, `biome`, `oxlint`)
- Whether `strict` mode is already on in tsconfig

---

## Phase 1: tsconfig Audit

Read every `tsconfig*.json` in the repo. Evaluate each flag below.

### 1.1 Strict Mode Baseline

The following flags should ALL be `true`. If `"strict": true` is set, most are implied — but
verify none are explicitly overridden to `false`.

| Flag | Why |
|------|-----|
| `strict` | Enables the full strict suite |
| `noImplicitAny` | Forbids implicit `any` — the most common source of type holes |
| `strictNullChecks` | Makes `null`/`undefined` distinct from other types |
| `strictFunctionTypes` | Catches contravariant function parameter bugs |
| `strictBindCallApply` | Types `bind`, `call`, `apply` correctly |
| `strictPropertyInitialization` | Ensures class properties are initialized |
| `noImplicitThis` | Flags untyped `this` usage |
| `useUnknownInCatchVariables` | Types `catch (e)` as `unknown` instead of `any` |

### 1.2 Additional Recommended Flags

| Flag | Effect |
|------|--------|
| `noUncheckedIndexedAccess` | Array index returns `T | undefined` — catches off-by-one bugs |
| `exactOptionalPropertyTypes` | Distinguishes `{x?: T}` from `{x: T | undefined}` |
| `noImplicitReturns` | All code paths must return a value |
| `noFallthroughCasesInSwitch` | Prevents accidental switch fallthrough |
| `noUnusedLocals` | Flag unused variables |
| `noUnusedParameters` | Flag unused function parameters |
| `forceConsistentCasingInFileNames` | Prevents cross-platform import bugs |
| `verbatimModuleSyntax` | Enforces `import type` for type-only imports (TS 5.0+) |
| `isolatedModules` | Required for SWC/esbuild transpilers; enables faster builds |

### 1.3 Dangerous Flags to Check For

Flag any of these if present and explain why they weaken safety:

- `"skipLibCheck": true` — silently ignores errors in `.d.ts` files (acceptable in some cases, but document why)
- `"allowJs": true` without `"checkJs": true` — JS files silently bypass type checking
- `"suppressImplicitAnyIndexErrors": true` — hides a class of real bugs
- `"noEmitOnError": false` — allows emitting broken output
- `"ignoreDeprecations"` — suppressing TS's own migration warnings

### 1.4 Path and Module Settings

- Is `moduleResolution` set to `"bundler"` or `"node16"` (preferred over legacy `"node"`)?
- Is `baseUrl` + `paths` used for aliases? If so, verify they match bundler config.
- Is `declaration: true` set for library packages?

**Output**: Produce a table of all flags audited, their current value, and recommended value.

---

## Phase 2: Code Smell Detection

Run these grep/AST patterns against `.ts` and `.tsx` files (excluding `node_modules`, `dist`, `.next`, `build`).

### 2.1 Type Assertion Smells (`as` keyword)

```bash
# Find all `as` casts (excluding `as const` which is fine)
grep -rn " as " --include="*.ts" --include="*.tsx" \
  --exclude-dir={node_modules,dist,.next,build,.turbo} \
  | grep -v "as const" | grep -v "// ts-audit-ignore"
```

Categorize findings:
- **`as unknown as T`** — double cast, almost always a sign of a type hole
- **`as any`** — direct escape hatch
- **`as T` on API/fetch responses** — response data cast without validation (should use Zod/valibot)
- **`as T` in tests** — often OK but document
- **`as T` in component props** — may indicate missing generic or wrong prop type

### 2.2 `any` Escapes

```bash
# Explicit any usages
grep -rn ": any|<any>|as any|any\[\]" --include="*.ts" --include="*.tsx" \
  --exclude-dir={node_modules,dist,.next,build,.turbo}
```

Distinguish:
- `// eslint-disable-next-line @typescript-eslint/no-explicit-any` — intentional, check for justification comment
- Bare `: any` with no comment — flag for remediation
- `Record<string, any>` — suggest `Record<string, unknown>` or a concrete type

### 2.3 Non-Null Assertions (`!`)

```bash
grep -rn "!\." --include="*.ts" --include="*.tsx" \
  --exclude-dir={node_modules,dist,.next,build,.turbo}
```

Flag patterns:
- `document.getElementById('x')!` — DOM lookups that could genuinely be null
- `obj.value!` on optional chain results
- `env.VARIABLE!` — suggest using a validated env schema (e.g. `t3-env`)

### 2.4 Redundant / Unnecessary Type Annotations

These are cases where TypeScript can infer the type — annotations add noise without safety benefit.

```bash
# Variables initialized with a literal that don't need annotation
grep -rn "const .* : string = |const .* : number = |const .* : boolean = " \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir={node_modules,dist,.next,build,.turbo}
```

Also look for:
- `useState<string>('')` — generic redundant when initial value is typed
- `const x: string[] = []` — fine since inference would give `never[]`, but flag for review
- Return type annotations on trivially-inferred functions (small helpers)

### 2.5 `@ts-ignore` and `@ts-expect-error`

```bash
grep -rn "@ts-ignore|@ts-expect-error|@ts-nocheck" --include="*.ts" --include="*.tsx" \
  --exclude-dir={node_modules,dist,.next,build,.turbo}
```

- `@ts-ignore` — **always** flag; prefer `@ts-expect-error` (at least it fails when fixed)
- `@ts-expect-error` without a comment explaining *why* — flag
- `@ts-nocheck` on a whole file — flag; entire file is untyped

### 2.6 `object`, `Object`, `Function` Types

```bash
grep -rn ": object\b|: Object\b|: Function\b" --include="*.ts" --include="*.tsx" \
  --exclude-dir={node_modules,dist,.next,build,.turbo}
```

- `: object` — too broad; suggest concrete type or `Record<string, unknown>`
- `: Object` — use `object` (lowercase) or avoid; `Object` includes primitives
- `: Function` — no parameter/return types; suggest explicit signature

### 2.7 Inline Interface/Type Duplication

Look for the same shape defined more than once inline:

```bash
# Find inline object type annotations in function params
grep -rn "(\s*{[^}]*})" --include="*.ts" --include="*.tsx" \
  --exclude-dir={node_modules,dist,.next,build,.turbo} | head -50
```

Heuristic: if the same structural shape appears in 2+ places, it should be a named type.

### 2.8 Unsafe `JSON.parse` and Fetch Responses

```bash
grep -rn "JSON\.parse|\.json()" --include="*.ts" --include="*.tsx" \
  --exclude-dir={node_modules,dist,.next,build,.turbo}
```

Flag any that immediately cast the result with `as T` without runtime validation.
Recommend: Zod, valibot, or `@total-typescript/ts-reset`.

### 2.9 `enum` Usage

```bash
grep -rn "^enum |^const enum " --include="*.ts" --include="*.tsx" \
  --exclude-dir={node_modules,dist,.next,build,.turbo}
```

- `const enum` — can cause issues with isolated modules / non-TS bundlers
- Regular `enum` — consider replacing with `as const` object + union type for better tree-shaking and compatibility

### 2.10 Missing Return Types on Exported Functions

Run `tsc --noEmit` and look for implicit return type errors. Also:

```bash
# Exported functions/arrow functions without explicit return types
grep -rn "^export function|^export const .* = (" --include="*.ts" --include="*.tsx" \
  --exclude-dir={node_modules,dist,.next,build,.turbo} \
  | grep -v ": " | head -40
```

Exported APIs should have explicit return types for documentation and stability.

---

## Phase 3: ESLint / TypeScript-ESLint Audit

### 3.1 Check for typescript-eslint

```bash
cat package.json | grep -E "typescript-eslint|@typescript-eslint"
```

If not installed, recommend adding `typescript-eslint` (the unified v8+ package).

### 3.2 Recommended Rule Sets to Enable

These rule sets should be enabled in order of strictness. Document which are currently active:

| Rule Set | When to use |
|----------|-------------|
| `tseslint.configs.recommended` | Baseline — should always be on |
| `tseslint.configs.recommendedTypeChecked` | Adds type-aware rules; requires `parserOptions.project` |
| `tseslint.configs.strict` | Stricter; catches more patterns |
| `tseslint.configs.strictTypeChecked` | Maximum strictness |
| `tseslint.configs.stylistic` / `stylisticTypeChecked` | Consistency rules |

### 3.3 High-Value Individual Rules to Verify

If using `recommendedTypeChecked` or higher, these should be on:

- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/no-floating-promises`
- `@typescript-eslint/await-thenable`
- `@typescript-eslint/no-misused-promises`
- `@typescript-eslint/consistent-type-imports` (enforce `import type`)
- `@typescript-eslint/consistent-type-assertions` (restrict `as` patterns)
- `@typescript-eslint/no-unnecessary-type-assertion`
- `@typescript-eslint/prefer-nullish-coalescing`
- `@typescript-eslint/prefer-optional-chain`

### 3.4 Run Type-Checked Lint

```bash
npx eslint . --ext .ts,.tsx --max-warnings 0 2>&1 | tail -50
```

Count errors by rule to identify the highest-impact fixes.

---

## Phase 4: Compiler Diagnostics

Run the TypeScript compiler in dry-run mode and capture all errors:

```bash
npx tsc --noEmit 2>&1 | tee /tmp/ts-errors.txt
wc -l /tmp/ts-errors.txt
# Group by error code
grep "error TS" /tmp/ts-errors.txt | grep -oP "TS\d+" | sort | uniq -c | sort -rn | head -20
```

Common error codes to investigate:
- `TS2322` — type not assignable (often from loose `as` casts)
- `TS2345` — argument not assignable
- `TS2339` — property does not exist
- `TS7006` — parameter implicitly has `any`
- `TS2531` — object possibly null
- `TS2532` — object possibly undefined

---

## Phase 5: Dependency Type Health

```bash
# Check for packages missing @types
cat package.json | jq '.dependencies | keys[]' | while read pkg; do
  if ! ls node_modules/@types/${pkg#@*/} 2>/dev/null | grep -q .; then
    echo "Missing @types for: $pkg"
  fi
done 2>/dev/null

# Find packages shipping their own types
grep -l '"types"|"typings"' node_modules/*/package.json 2>/dev/null | head -20
```

Also check:
- Is `@types/node` installed if using Node.js APIs?
- Are `@types` packages pinned to matching major versions?

---

## Phase 6: Produce the Audit Report

Structure the output as follows:

### Report Structure

```
## TypeScript Audit Report

### Executive Summary
- Files audited: N
- tsconfig flags to change: N
- Code smells found: N (broken down by category)
- ESLint rules to add: N
- Compiler errors: N

### Critical Issues (fix first)
[Issues that likely represent runtime bugs or total type holes]

### High Priority
[Issues that weaken type safety significantly]

### Medium Priority
[Code smell cleanups, annotation noise, style]

### Low Priority / Optional
[Stylistic preferences, minor improvements]

### tsconfig Recommendations
[Table: flag | current | recommended | rationale]

### ESLint Recommendations
[List of rules to add with one-line rationale each]

### Tooling Recommendations
[See Phase 7 below]
```

For each issue, include:
- File + line number (or file count if widespread)
- Current code snippet
- Recommended fix
- Why it matters

---

## Phase 7: Tooling & MCP Recommendations

Include this section in every audit report.

### Essential Libraries

| Tool | Purpose | Install |
|------|---------|---------|
| `@total-typescript/ts-reset` | Fixes broken TS stdlib types (e.g. `JSON.parse → unknown`) | `pnpm add -D @total-typescript/ts-reset` |
| `zod` or `valibot` | Runtime validation for API responses, env vars, user input | `pnpm add zod` |
| `t3-env` | Type-safe environment variable validation | `pnpm add @t3-oss/env-nextjs` |
| `typescript-eslint` | Unified ESLint + TS integration (v8+) | `pnpm add -D typescript-eslint` |
| `knip` | Finds unused exports, files, and dependencies | `pnpm add -D knip` |
| `tsc-files` | Run `tsc` on only changed files (CI performance) | `pnpm add -D tsc-files` |

### MCP Servers for TypeScript Development

These MCP servers can be added to Claude Code or Cursor to give your AI assistant live
TypeScript documentation and tooling context:

#### 1. Context7 MCP (Recommended)
Provides up-to-date library documentation for TypeScript, React, Next.js, Zod, and more.

```json
// .cursor/mcp.json or claude_desktop_config.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

Use it in prompts: *"Using context7, show me the Zod docs for discriminated unions"*

#### 2. TypeScript Language Server MCP
Exposes go-to-definition, hover types, and diagnostics to the AI agent directly.

```bash
# Install the MCP wrapper for tsserver
npm install -g @modelcontextprotocol/server-typescript
```

#### 3. ESLint MCP (if available)
Some MCP registries include ESLint rule documentation servers — useful for understanding
which rules to enable and what they catch.

#### 4. Official Docs MCP / Brave Search MCP
For pulling TypeScript Handbook content or release notes:

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "your-key" }
    }
  }
}
```

### VS Code / Editor Setup

Recommend verifying these VS Code settings for TypeScript projects:

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.preferences.preferTypeOnlyAutoImports": true
}
```

---

## Phase 8: Prioritized Fix Plan

After the report, produce a concrete ordered task list:

1. **Update tsconfig** — lowest risk, highest ROI
2. **Enable `recommendedTypeChecked` ESLint rules** — surfaces hidden issues
3. **Fix all `@ts-ignore`** — replace with proper types or `@ts-expect-error` + comment
4. **Eliminate `as any` and `as unknown as T`** — highest bug risk
5. **Add runtime validation to JSON.parse / fetch** — prevents runtime type holes
6. **Replace `non-null assertions` (!)**  with proper null handling
7. **Rename `object`/`Function` types** to concrete types
8. **Extract duplicated inline types** to named interfaces
9. **Clean up redundant annotations** — noise reduction
10. **Set up Knip** to find dead code / unused exports

---

## Notes for the Agent

- Always run `tsc --noEmit` before and after making changes to verify error count goes down.
- When fixing `as T` casts on fetch responses, prefer adding a Zod schema rather than just
  removing the cast — removing it without validation often just shifts where the error surfaces.
- In monorepos, audit each package's tsconfig independently; `extends` chains can override flags.
- When the user's project uses Next.js, Expo, or another framework, note that some tsconfig
  flags (like `moduleResolution`) may be managed by the framework and should not be overridden.
- Be conservative with `noUncheckedIndexedAccess` — it often requires widespread `?? []` /
  optional chaining changes and may be better introduced incrementally.

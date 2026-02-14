# Technology Stack

**Analysis Date:** 2026-02-13

## Languages

**Primary:**
- TypeScript 5.2.2 - Core application logic, React components, API routes
- JavaScript 18.2.0 - React ecosystem, Node.js runtime

**Secondary:**
- JSX - React component markup
- JSON - Configuration files, API responses

## Runtime

**Environment:**
- Node.js - Next.js server runtime

**Package Manager:**
- pnpm - Package dependency management
- Lockfile: pnpm-lock.yaml present

## Frameworks

**Core:**
- Next.js 13.4.19 - Full-stack React framework
- React 18.2.0 - UI component library
- Tailwind CSS 3.3.3 - Utility-first styling

**Testing:**
- None detected

**Build/Dev:**
- PostCSS 8.4.29 - CSS transformation pipeline
- Autoprefixer 10.4.15 - CSS vendor prefixing
- TypeScript compiler - Type checking and code generation
- ESLint - Code linting
- Prettier - Code formatting

## Key Dependencies

**Critical:**
- @slack/bolt 3.14.0 - Slack app framework for messaging
- googleapis 144.0.0 - Google API client
- nodemailer 6.10.0 - Email sending
- ioredis 5.6.0 - Redis client
- date-fns 2.30.0 - Date manipulation utilities
- date-fns-tz 2.0.0 - Timezone support

**Infrastructure:**
- rambdax 10.0.0 - Functional programming utilities
- webpack-node-externals 3.0.0 - Webpack configuration

## Configuration

**Environment:**
- Environment variables configured via .env.local
- Critical dependencies: Slack credentials, Google OAuth, Redis URL, Trello API keys
- Path alias: @/* maps to ./src/*

**Build:**
- TypeScript configuration in tsconfig.json
- Next.js configuration in next.config.js
- Tailwind configuration in tailwind.config.ts
- PostCSS configuration in postcss.config.js
- ESLint configuration in .eslintrc.json

## Platform Requirements

**Development:**
- Node.js 20.6.0
- pnpm package manager

**Production:**
- Node.js runtime
- Redis instance for caching
- SMTP server for email (Gmail OAuth)

---

*Stack analysis: 2026-02-13*
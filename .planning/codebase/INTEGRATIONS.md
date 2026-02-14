# External Integrations

**Analysis Date:** 2026-02-13

## APIs & External Services

**Slack:**
- Slack Bolt SDK (@slack/bolt 3.14.0) - Interactive message handling, modals, buttons
- Usage: Sacrament speakers submission, automated messaging, cron job notifications
- Authentication: SLACK_USER_OAUTH_TOKEN, SLACK_SIGNING_SECRET
- Channels: Bishopric channel, automation testing channel

**Google:**
- Gmail OAuth API (googleapis) - Email sending functionality
- Usage: Sending sacrament speakers lists via email
- Authentication: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, EMAIL_SENDER, EMAIL_RECIPIENT
- SDK: nodemailer with OAuth2

**Trello:**
- Trello REST API - Fetching member data and cards
- Usage: Interview schedules, calling cards, setting apart cards
- Authentication: TRELLO_API_KEY, TRELLO_API_TOKEN
- Endpoints:
  - /boards/69813f1cb775468cd996e126/members (members)
  - /lists/{listId}/cards (cards)
- Boards: Interview board, Callings board, Setting Apart board

## Data Storage

**Caching:**
- Redis (ioredis) - Message deduplication for email sending
- Usage: Track when sacrament speakers emails have been sent to prevent duplicates
- Connection: REDIS_URL environment variable
- Expiration: Automatic cleanup after specific dates (Wednesday expirations)

**File Storage:**
- Local filesystem only - Configuration files, templates, build artifacts

## Authentication & Identity

**OAuth:**
- Google OAuth 2.0 - Gmail API authentication
- Flow: Refresh token-based for email sending

**API Keys:**
- Trello API keys - REST API authentication
- Slack OAuth tokens - Application authentication

**Internal Auth:**
- CRON_SECRET - Secure endpoint access for scheduled jobs
- Bearer token authentication for cron endpoints

## Monitoring & Observability

**Error Tracking:**
- None detected
- Error handling: Console.error logging throughout

**Logs:**
- Console logging - Debug information, error reporting, success messages
- Redis operations tracking with timestamps
- Email sending status tracking

## CI/CD & Deployment

**Hosting:**
- Vercel - Deployment platform (vercel.json present)
- Next.js optimized for serverless deployment

**CI Pipeline:**
- Not detected in codebase

## Environment Configuration

**Required env vars:**
- REDIS_URL - Redis connection string
- SLACK_USER_OAUTH_TOKEN - Slack app OAuth token
- SLACK_SIGNING_SECRET - Slack webhook signing secret
- GMAIL_CLIENT_ID - Google OAuth2 client ID
- GMAIL_CLIENT_SECRET - Google OAuth2 client secret
- GMAIL_REFRESH_TOKEN - Google OAuth2 refresh token
- EMAIL_SENDER - Sender email address
- EMAIL_RECIPIENT - Recipient email address
- TRELLO_API_KEY - Trello API key
- TRELLO_API_TOKEN - Trello API token
- CRON_SECRET - Secure access token for cron endpoints

**Secrets location:**
- .env.local file (exists but contents not accessible)

## Webhooks & Callbacks

**Incoming:**
- Slack interactivity endpoints - Button clicks, modal submissions
- Route: /api/slack/interactivity
- Slack commands and interactions

**Outgoing:**
- Trello API calls - Fetch data periodically
- Email notifications via Gmail API
- Slack messages via Bolt SDK

---

*Integration audit: 2026-02-13*
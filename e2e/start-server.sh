#!/bin/bash
# Unset .env.local vars that would override test vars
unset REDIS_URL
unset TRELLO_BASE_URL
unset TRELLO_API_KEY
unset TRELLO_API_TOKEN
export NODE_ENV=test
export REDIS_URL=redis://localhost:6399
export TRELLO_BASE_URL=http://localhost:9999
export TRELLO_API_KEY=test-api-key
export TRELLO_API_TOKEN=test-api-token
export NEXTAUTH_SECRET=cVfM4hau1qdO8imEsVC417G1F3dKQ0ht
export NEXTAUTH_URL=http://localhost:3001
pnpm dev -p 3001

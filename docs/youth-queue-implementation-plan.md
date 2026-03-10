# Youth Visitation Queue — Complete Implementation Plan

## Overview

A priority queue for managing youth visitation scheduling, integrated with Trello for workflow management. Youth surface automatically after 6 months and can be scheduled for visits via Trello card creation with automation codes.

**Key Features:**

- Automatic 6-month rotation queue
- Trello integration for scheduling workflow
- Visit type dropdown with automation codes (BYI, CYI, YSAI, TRI)
- Card ID linking for accurate sync
- Manual sync button to mark completed visits
- Basic Auth protection (existing)

**Tech Stack:**

- Next.js 13 (App Router) ✓
- ioredis ✓
- Tailwind CSS ✓
- Trello API ✓
- Basic Auth ✓

---

## Data Model

### Redis Keys

```
youth:{id}             → Hash    Individual youth record
youth:queue            → ZSet    Priority queue (score = timestamp)
```

### Youth Hash Fields

| Field         | Type    | Description                     | Example                       |
| ------------- | ------- | ------------------------------- | ----------------------------- |
| id            | string  | Unique ID (nanoid)              | "V1StGXR8_Z5jdHi6B-myT"       |
| name          | string  | Display name                    | "Amara Johnson"               |
| lastSeenAt    | number  | Last visit timestamp (epoch ms) | 1704067200000                 |
| scheduled     | boolean | Has active Trello card          | true                          |
| scheduledAt   | number  | When scheduled (epoch ms)       | 1704153600000                 |
| trelloCardId  | string  | Trello card ID                  | "abc123def456"                |
| trelloCardUrl | string  | Trello card URL                 | "https://trello.com/c/abc123" |
| visitType     | string  | Visit type ID                   | "bishop-youth-interview"      |
| note          | string  | Optional note                   | "Family crisis"               |
| createdAt     | number  | Record creation (epoch ms)      | 1703980800000                 |

### Queue Scoring

```typescript
// Normal: 6 months from last visit
normalScore = lastSeenAt + 180 * 24 * 60 * 60 * 1000;

// Scheduled: Negative timestamp (most recent = highest priority)
scheduledScore = -Date.now();
```

**Queue Order:**

1. Recently scheduled (most negative score first)
2. Overdue (score < now)
3. Approaching due date
4. Recently visited

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── queue/
│   │   │   └── route.ts                 # GET - Fetch queue
│   │   └── youth/
│   │       ├── route.ts                 # POST - Create youth
│   │       ├── sync/
│   │       │   └── route.ts             # POST - Sync with Trello
│   │       └── [id]/
│   │           ├── route.ts             # DELETE - Remove youth
│   │           └── schedule/
│   │               └── route.ts         # POST - Schedule visit
│   └── youth/
│       ├── page.tsx                     # Dashboard page
│       ├── new/
│       │   └── page.tsx                 # Add youth form
│       └── ScheduleVisitModal.tsx       # Schedule modal
├── components/
│   ├── VisitTypeSelector.tsx            # Visit type dropdown
│   └── YouthCard.tsx                    # Youth card component
├── constants/
│   ├── youth-visit-types.ts             # Visit type definitions
│   └── index.ts                         # Export all constants
├── types/
│   └── youth.ts                         # Youth type definitions
└── utils/
    ├── youth-queue.ts                   # Queue operations
    └── trello-youth.ts                  # Trello integration
```

---

## Implementation Steps

### Step 1: Type Definitions

**Create:** `src/types/youth.ts`

```typescript
export interface Youth {
  id: string;
  name: string;
  lastSeenAt: number;
  scheduled: boolean;
  scheduledAt?: number;
  trelloCardId?: string;
  trelloCardUrl?: string;
  visitType?: string;
  note?: string;
  createdAt: number;
}

export interface CreateYouthInput {
  name: string;
}

export interface ScheduleVisitInput {
  visitType: string;
  note?: string;
}

export interface VisitType {
  id: string;
  name: string;
  automationCode: string;
  description: string;
}

export interface YouthVisitTrelloCard {
  id: string;
  name: string;
  url: string;
  shortUrl: string;
  idList: string;
  dateLastActivity: string;
}

export interface SyncResult {
  markedVisited: string[];
  errors: string[];
}
```

**Update:** `src/types/index.ts` (if it exists, otherwise skip)

```typescript
export * from "./youth";
```

---

### Step 2: Constants

**Create:** `src/constants/youth-visit-types.ts`

```typescript
import type { VisitType } from "@/types/youth";

export const YOUTH_VISIT_TYPES: Record<string, VisitType> = {
  "bishop-youth-interview": {
    id: "bishop-youth-interview",
    name: "Bishop Youth Interview",
    automationCode: "BYI",
    description: "Annual bishop interview for youth",
  },
  "counselor-youth-interview": {
    id: "counselor-youth-interview",
    name: "Counselor Youth Interview",
    automationCode: "CYI",
    description: "Annual counselor interview for youth",
  },
  "ysa-interview": {
    id: "ysa-interview",
    name: "YSA Interview",
    automationCode: "YSAI",
    description: "Young single adult interview",
  },
  "temple-recommend-interview": {
    id: "temple-recommend-interview",
    name: "Temple Recommend Interview",
    automationCode: "TRI",
    description: "Temple recommend renewal interview",
  },
  other: {
    id: "other",
    name: "Other",
    automationCode: "",
    description: "General visit (no automation)",
  },
};

export const VISIT_TYPE_OPTIONS = Object.values(YOUTH_VISIT_TYPES);
```

**Update:** `src/constants.ts`

Add to `REDIS_KEYS`:

```typescript
export const REDIS_KEYS = {
  // ... existing keys ...
  YOUTH_HASH_PREFIX: "youth:",
  YOUTH_QUEUE: "youth:queue",
} as const;
```

Add to `TRELLO_LIST_IDS` (placeholder values - update later):

```typescript
export const TRELLO_LIST_IDS = {
  // ... existing IDs ...
  YOUTH_VISITS_TO_SCHEDULE: "REPLACE_WITH_YOUR_LIST_ID",
  YOUTH_VISITS_COMPLETE: "REPLACE_WITH_YOUR_LIST_ID",
} as const;
```

**Update:** `src/constants/index.ts` (if it exists)

```typescript
export * from "./youth-visit-types";
export * from "./appointment-summaries";
// ... other exports
```

---

### Step 3: Utility Functions

**Create:** `src/utils/youth-queue.ts`

```typescript
import redis from "@/utils/redis";
import { nanoid } from "nanoid";
import type { Youth } from "@/types/youth";
import { REDIS_KEYS } from "@/constants";

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

function normalScore(lastSeenAt: number): number {
  return lastSeenAt + SIX_MONTHS_MS;
}

function scheduledScore(): number {
  return -Date.now();
}

function deserializeYouth(raw: Record<string, string>): Youth {
  return {
    id: raw.id,
    name: raw.name,
    lastSeenAt: Number(raw.lastSeenAt),
    scheduled: raw.scheduled === "true",
    scheduledAt: raw.scheduledAt ? Number(raw.scheduledAt) : undefined,
    trelloCardId: raw.trelloCardId || undefined,
    trelloCardUrl: raw.trelloCardUrl || undefined,
    visitType: raw.visitType || undefined,
    note: raw.note || undefined,
    createdAt: Number(raw.createdAt),
  };
}

export async function getQueue(): Promise<Youth[]> {
  const ids = await redis.zrange(REDIS_KEYS.YOUTH_QUEUE, 0, -1);
  if (!ids.length) return [];

  const pipeline = redis.pipeline();
  (ids as string[]).forEach((id) =>
    pipeline.hgetall(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`),
  );

  const results = await pipeline.exec();
  return (results as (Record<string, string> | null)[])
    .filter((r): r is Record<string, string> => r !== null)
    .map(deserializeYouth);
}

export async function getYouthById(id: string): Promise<Youth | null> {
  const raw = await redis.hgetall(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`);
  if (!raw || Object.keys(raw).length === 0) return null;
  return deserializeYouth(raw);
}

export async function createYouth(name: string): Promise<Youth> {
  const id = nanoid();
  const now = Date.now();
  const youth: Youth = {
    id,
    name,
    lastSeenAt: now,
    scheduled: false,
    createdAt: now,
  };

  await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`, {
    ...youth,
    scheduled: "false",
  });
  await redis.zadd(REDIS_KEYS.YOUTH_QUEUE, {
    score: normalScore(now),
    member: id,
  });

  return youth;
}

export async function markVisited(id: string): Promise<void> {
  const now = Date.now();
  await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`, {
    lastSeenAt: now.toString(),
    scheduled: "false",
    scheduledAt: "",
    trelloCardId: "",
    trelloCardUrl: "",
    visitType: "",
    note: "",
  });
  await redis.zadd(REDIS_KEYS.YOUTH_QUEUE, {
    score: normalScore(now),
    member: id,
  });
}

export async function deleteYouth(id: string): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.del(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`);
  pipeline.zrem(REDIS_KEYS.YOUTH_QUEUE, id);
  await pipeline.exec();
}
```

**Create:** `src/utils/trello-youth.ts`

```typescript
import redis from "@/utils/redis";
import type { Youth, YouthVisitTrelloCard, SyncResult } from "@/types/youth";
import { YOUTH_VISIT_TYPES } from "@/constants/youth-visit-types";
import { REDIS_KEYS, TRELLO_LIST_IDS } from "@/constants";
import { getQueue, markVisited } from "./youth-queue";

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_API_TOKEN = process.env.TRELLO_API_TOKEN;

async function createTrelloCard(
  youthName: string,
  visitTypeId: string,
  note?: string,
): Promise<{ id: string; url: string }> {
  const visitType = YOUTH_VISIT_TYPES[visitTypeId];

  if (!visitType) {
    throw new Error(`Unknown visit type: ${visitTypeId}`);
  }

  // Build card name
  let cardName = youthName;
  if (note) {
    cardName += ` - ${note}`;
  }
  if (visitType.automationCode) {
    cardName += visitType.automationCode;
  }

  // Examples:
  // "Amara JohnsonBYI"
  // "Marcus Chen - Family crisisBYI"
  // "Taylor WilliamsYSAI"
  // "Alex Brown" (no code for "other")

  const response = await fetch(
    `https://api.trello.com/1/cards?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cardName,
        idList: TRELLO_LIST_IDS.YOUTH_VISITS_TO_SCHEDULE,
        pos: "top",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create Trello card: ${response.statusText}`);
  }

  const card = await response.json();
  return { id: card.id, url: card.url };
}

async function fetchCompleteCards(): Promise<YouthVisitTrelloCard[]> {
  const response = await fetch(
    `https://api.trello.com/1/lists/${TRELLO_LIST_IDS.YOUTH_VISITS_COMPLETE}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}&fields=id,name,url,shortUrl,idList,dateLastActivity`,
    { cache: "no-cache" },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Trello cards: ${response.statusText}`);
  }

  return response.json();
}

export async function scheduleVisit(
  id: string,
  visitType: string,
  note?: string,
): Promise<{ trelloCardUrl: string }> {
  const youthData = await redis.hgetall(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`);
  if (!youthData || !youthData.name) {
    throw new Error("Youth not found");
  }

  // Create Trello card
  const trelloCard = await createTrelloCard(
    youthData.name as string,
    visitType,
    note,
  );

  // Update youth record
  await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`, {
    scheduled: "true",
    scheduledAt: Date.now().toString(),
    trelloCardId: trelloCard.id,
    trelloCardUrl: trelloCard.url,
    visitType,
    note: note || "",
  });

  // Move to top of queue (negative timestamp)
  await redis.zadd(REDIS_KEYS.YOUTH_QUEUE, {
    score: -Date.now(),
    member: id,
  });

  return { trelloCardUrl: trelloCard.url };
}

export async function syncWithTrello(): Promise<SyncResult> {
  const completeCards = await fetchCompleteCards();
  const allYouth = await getQueue();

  const markedVisited: string[] = [];
  const errors: string[] = [];

  // Find youth with Trello cards in Complete list
  for (const youth of allYouth) {
    if (!youth.scheduled || !youth.trelloCardId) continue;

    const matchingCard = completeCards.find(
      (card) => card.id === youth.trelloCardId,
    );

    if (matchingCard) {
      try {
        await markVisited(youth.id);
        markedVisited.push(youth.name);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to mark ${youth.name} as visited: ${errorMsg}`);
      }
    }
  }

  return { markedVisited, errors };
}
```

---

### Step 4: API Routes

**Create:** `src/app/api/queue/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getQueue } from "@/utils/youth-queue";

export async function GET() {
  try {
    const queue = await getQueue();
    return NextResponse.json({ queue });
  } catch (error) {
    console.error("Error fetching queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue" },
      { status: 500 },
    );
  }
}
```

**Create:** `src/app/api/youth/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createYouth } from "@/utils/youth-queue";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const youth = await createYouth(name.trim());
    return NextResponse.json({ youth });
  } catch (error) {
    console.error("Error creating youth:", error);
    return NextResponse.json(
      { error: "Failed to create youth" },
      { status: 500 },
    );
  }
}
```

**Create:** `src/app/api/youth/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getYouthById, deleteYouth } from "@/utils/youth-queue";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const youth = await getYouthById(params.id);
    if (!youth) {
      return NextResponse.json({ error: "Youth not found" }, { status: 404 });
    }
    return NextResponse.json({ youth });
  } catch (error) {
    console.error("Error fetching youth:", error);
    return NextResponse.json(
      { error: "Failed to fetch youth" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await deleteYouth(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting youth:", error);
    return NextResponse.json(
      { error: "Failed to delete youth" },
      { status: 500 },
    );
  }
}
```

**Create:** `src/app/api/youth/[id]/schedule/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { scheduleVisit } from "@/utils/trello-youth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { visitType, note } = body;

    if (!visitType) {
      return NextResponse.json(
        { error: "Visit type is required" },
        { status: 400 },
      );
    }

    const result = await scheduleVisit(params.id, visitType, note);

    return NextResponse.json({
      success: true,
      trelloCardUrl: result.trelloCardUrl,
    });
  } catch (error) {
    console.error("Error scheduling visit:", error);
    return NextResponse.json(
      { error: "Failed to schedule visit" },
      { status: 500 },
    );
  }
}
```

**Create:** `src/app/api/youth/sync/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { syncWithTrello } from "@/utils/trello-youth";

export async function POST(request: NextRequest) {
  try {
    const result = await syncWithTrello();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error syncing with Trello:", error);
    return NextResponse.json(
      { error: "Failed to sync with Trello" },
      { status: 500 },
    );
  }
}
```

---

### Step 5: Frontend Components

**Create:** `src/components/VisitTypeSelector.tsx`

```typescript
"use client";

import { Select } from "@/components/ui/Select";
import { VISIT_TYPE_OPTIONS } from "@/constants/youth-visit-types";

interface VisitTypeSelectorProps {
  selectedVisitType: string;
  onChange: (visitType: string) => void;
  className?: string;
}

export function VisitTypeSelector({
  selectedVisitType,
  onChange,
  className = "w-full",
}: VisitTypeSelectorProps) {
  return (
    <Select
      className={className}
      value={selectedVisitType}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select visit type
      </option>

      {VISIT_TYPE_OPTIONS.map((type) => (
        <option key={type.id} value={type.id} title={type.description}>
          {type.name}
          {type.automationCode && ` (${type.automationCode})`}
        </option>
      ))}
    </Select>
  );
}
```

**Create:** `src/app/youth/ScheduleVisitModal.tsx`

```typescript
"use client";

import { useState } from "react";
import { VisitTypeSelector } from "@/components/VisitTypeSelector";
import { YOUTH_VISIT_TYPES } from "@/constants/youth-visit-types";
import toast from "react-hot-toast";

interface ScheduleVisitModalProps {
  youthId: string;
  youthName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function ScheduleVisitModal({
  youthId,
  youthName,
  onSuccess,
  onClose,
}: ScheduleVisitModalProps) {
  const [visitType, setVisitType] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSchedule = async () => {
    if (!visitType) {
      toast.error("Please select a visit type");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/youth/${youthId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitType, note: note.trim() || undefined }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule");
      }

      const data = await response.json();

      toast.success(`Visit scheduled for ${youthName}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to schedule visit");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewCardName = () => {
    let name = youthName;
    if (note.trim()) name += ` - ${note.trim()}`;
    if (visitType && YOUTH_VISIT_TYPES[visitType]?.automationCode) {
      name += YOUTH_VISIT_TYPES[visitType].automationCode;
    }
    return name;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Schedule Visit for {youthName}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visit Type *
            </label>
            <VisitTypeSelector
              selectedVisitType={visitType}
              onChange={setVisitType}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Family crisis, annual interview"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {visitType && (
            <div className="bg-gray-50 rounded-md p-3 text-sm">
              <p className="font-medium text-gray-700 mb-1">
                Trello card name:
              </p>
              <code className="text-gray-900 break-all">
                {previewCardName()}
              </code>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting || !visitType}
          >
            {isSubmitting ? "Scheduling..." : "Schedule Visit"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Create:** `src/app/youth/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { ScheduleVisitModal } from "./ScheduleVisitModal";
import type { Youth } from "@/types/youth";

export default function YouthQueuePage() {
  const [queue, setQueue] = useState<Youth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    youthId: string;
    youthName: string;
  } | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await fetch("/api/queue");
      const data = await response.json();
      setQueue(data.queue);
    } catch (error) {
      toast.error("Failed to load queue");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    const toastId = toast.loading("Syncing with Trello...");

    try {
      const response = await fetch("/api/youth/sync", { method: "POST" });
      const data = await response.json();

      toast.dismiss(toastId);

      if (data.markedVisited.length > 0) {
        toast.success(
          `Marked ${data.markedVisited.length} as visited: ${data.markedVisited.join(", ")}`
        );
        fetchQueue();
      } else {
        toast.info("No visits completed since last sync");
      }

      if (data.errors.length > 0) {
        toast.error(`Errors: ${data.errors.join(", ")}`);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to sync");
      console.error(error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the queue?`)) return;

    try {
      await fetch(`/api/youth/${id}`, { method: "DELETE" });
      toast.success(`${name} removed from queue`);
      fetchQueue();
    } catch (error) {
      toast.error("Failed to delete");
      console.error(error);
    }
  };

  const getDaysOverdue = (youth: Youth): number => {
    const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
    return Math.floor((sixMonthsAgo - youth.lastSeenAt) / (24 * 60 * 60 * 1000));
  };

  // Queue sections
  const scheduledYouth = queue.filter((y) => y.scheduled);
  const overdueYouth = queue.filter(
    (y) => !y.scheduled && getDaysOverdue(y) > 0
  );
  const recentlyVisited = queue.filter(
    (y) => !y.scheduled && getDaysOverdue(y) <= -150
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading queue...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Youth Visitation Queue
        </h1>

        <div className="flex gap-3">
          <a
            href="/youth/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Youth
          </a>
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Sync with Trello
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-gray-900">{queue.length}</div>
          <div className="text-sm text-gray-600">Total Youth</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-red-600">
            {scheduledYouth.length}
          </div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {overdueYouth.length}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      {/* Scheduled Section */}
      {scheduledYouth.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Scheduled Visits ({scheduledYouth.length})
          </h2>
          <div className="space-y-3">
            {scheduledYouth.map((youth) => (
              <YouthCard
                key={youth.id}
                youth={youth}
                onSchedule={() =>
                  setScheduleModal({
                    isOpen: true,
                    youthId: youth.id,
                    youthName: youth.name,
                  })
                }
                onDelete={() => handleDelete(youth.id, youth.name)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Overdue Section */}
      {overdueYouth.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Due for Visit ({overdueYouth.length})
          </h2>
          <div className="space-y-3">
            {overdueYouth.map((youth) => (
              <YouthCard
                key={youth.id}
                youth={youth}
                onSchedule={() =>
                  setScheduleModal({
                    isOpen: true,
                    youthId: youth.id,
                    youthName: youth.name,
                  })
                }
                onDelete={() => handleDelete(youth.id, youth.name)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Visited Section */}
      {recentlyVisited.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recently Visited ({recentlyVisited.length})
          </h2>
          <div className="space-y-3">
            {recentlyVisited.map((youth) => (
              <YouthCard
                key={youth.id}
                youth={youth}
                onSchedule={() =>
                  setScheduleModal({
                    isOpen: true,
                    youthId: youth.id,
                    youthName: youth.name,
                  })
                }
                onDelete={() => handleDelete(youth.id, youth.name)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {queue.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No youth in the queue yet.</p>
          <a
            href="/youth/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
          >
            Add Your First Youth
          </a>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal?.isOpen && (
        <ScheduleVisitModal
          youthId={scheduleModal.youthId}
          youthName={scheduleModal.youthName}
          onSuccess={fetchQueue}
          onClose={() => setScheduleModal(null)}
        />
      )}
    </div>
  );
}

// Youth Card Component
function YouthCard({
  youth,
  onSchedule,
  onDelete,
}: {
  youth: Youth;
  onSchedule: () => void;
  onDelete: () => void;
}) {
  const daysOverdue = Math.floor(
    (Date.now() - 180 * 24 * 60 * 60 * 1000 - youth.lastSeenAt) /
      (24 * 60 * 60 * 1000)
  );

  return (
    <div className="bg-white rounded-lg p-4 shadow border-l-4 border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {youth.scheduled && (
              <span className="text-red-500 text-lg" title="Scheduled">
                🔴
              </span>
            )}
            {daysOverdue > 0 && !youth.scheduled && (
              <span className="text-yellow-500 text-lg" title="Overdue">
                ⚠️
              </span>
            )}
            {daysOverdue <= -150 && !youth.scheduled && (
              <span className="text-green-500 text-lg" title="Recently visited">
                ✅
              </span>
            )}
            <h3 className="font-semibold text-gray-900">{youth.name}</h3>
          </div>

          <p className="text-sm text-gray-600">
            Last visited:{" "}
            {formatDistanceToNow(youth.lastSeenAt, { addSuffix: true })}
            {daysOverdue > 0 && (
              <span className="text-red-600 ml-2">
                ({daysOverdue} days overdue)
              </span>
            )}
          </p>

          {youth.note && (
            <p className="text-sm text-gray-700 mt-1">Note: {youth.note}</p>
          )}

          {youth.scheduled && youth.trelloCardUrl && (
            <a
              href={youth.trelloCardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              View Trello Card →
            </a>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          {!youth.scheduled && (
            <button
              onClick={onSchedule}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Schedule
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Create:** `src/app/youth/new/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NewYouthPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/youth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) throw new Error("Failed to create youth");

      toast.success(`${name.trim()} added to queue`);
      router.push("/youth");
    } catch (error) {
      toast.error("Failed to add youth");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Youth</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name *
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Amara Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? "Adding..." : "Add Youth"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## Testing Checklist

### Manual Testing

**Youth Creation:**

- [ ] Can add youth via `/youth/new`
- [ ] Name is trimmed and validated
- [ ] Youth appears in queue with "Recently visited" status
- [ ] Success toast appears

**Queue Display:**

- [ ] Queue loads on page mount
- [ ] Youth sorted correctly (scheduled → overdue → recently visited)
- [ ] Stats show correct counts
- [ ] Days overdue calculated correctly
- [ ] Emoji indicators show correctly (🔴⚠️✅)

**Schedule Visit:**

- [ ] "Schedule" button opens modal
- [ ] Visit type dropdown shows all options
- [ ] Note field accepts optional text
- [ ] Card name preview updates in real-time
- [ ] Can create Trello card successfully
- [ ] Youth moves to "Scheduled" section
- [ ] Trello card URL is accessible
- [ ] Success toast appears

**Trello Integration:**

- [ ] Trello card created with correct name format
- [ ] Automation code appended correctly (e.g., "Amara JohnsonBYI")
- [ ] Card appears in correct Trello list
- [ ] Trello Butler automation triggers (adds label, assigns member, removes code)
- [ ] Card name clean after automation (no code)

**Sync with Trello:**

- [ ] Move Trello card to "Complete" list
- [ ] Click "Sync with Trello" button
- [ ] Youth marked as visited
- [ ] Youth moves to "Recently visited" section
- [ ] Last visited date updates
- [ ] Trello card fields cleared
- [ ] Success toast shows which youth were visited

**Delete Youth:**

- [ ] Delete confirmation dialog appears
- [ ] Youth removed from queue
- [ ] Youth removed from Redis
- [ ] Success toast appears

**Error Handling:**

- [ ] Trello API failure shows error toast
- [ ] Missing fields show validation errors
- [ ] Network errors handled gracefully
- [ ] Console errors logged appropriately

**Edge Cases:**

- [ ] Youth with same name can coexist (different IDs)
- [ ] Empty queue shows "Add Youth" prompt
- [ ] Scheduled youth can be rescheduled (replaces Trello card)
- [ ] Long names/notes don't break layout
- [ ] Mobile responsive (buttons stack on small screens)

### Automated Testing (Optional)

**Create:** `src/utils/youth-queue.test.ts`

```typescript
import { describe, it, expect } from "vitest";
// Add unit tests for queue operations
```

**Create:** `src/utils/trello-youth.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";
// Add unit tests for Trello integration
```

---

## Deployment Steps

### 1. Pre-Deployment Setup

**Add Trello List IDs:**

Update `src/constants.ts` with actual list IDs:

```typescript
export const TRELLO_LIST_IDS = {
  // ... existing IDs ...
  YOUTH_VISITS_TO_SCHEDULE: "YOUR_ACTUAL_LIST_ID_HERE",
  YOUTH_VISITS_COMPLETE: "YOUR_ACTUAL_LIST_ID_HERE",
} as const;
```

**To find list IDs:**

1. Open Trello board in browser
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Look for requests to `/1/lists/`
6. The list ID is in the URL

**Or use Trello API:**

```bash
curl "https://api.trello.com/1/boards/{boardId}/lists?key={apiKey}&token={token}"
```

### 2. Install Dependencies

```bash
pnpm add nanoid
```

### 3. Create All Files

Follow the file structure and code from implementation steps above.

### 4. Run Linting

```bash
pnpm lint
```

Fix any linting errors.

### 5. Test Locally

```bash
pnpm dev
```

Visit http://localhost:3000/youth and test all functionality.

### 6. Commit and Push

```bash
git add .
git commit -m "feat: add youth visitation queue with Trello integration"
git push origin experiment/youth-queue
```

### 7. Deploy to Vercel

Vercel will auto-deploy when you push. Monitor deployment in Vercel dashboard.

### 8. Verify in Production

- [ ] `/youth` page loads
- [ ] Can add youth
- [ ] Can schedule visits
- [ ] Trello cards created
- [ ] Sync works
- [ ] Basic Auth protects routes

---

## Trello Butler Setup (Reference)

You mentioned automations are already set up, but for reference:

### Rule 1: Bishop Youth Interview [BYI]

```
When a card with name containing "BYI" is created,
add label "Bishop Youth Interview",
add member @{bishop_username},
and remove the text "BYI" from the card name.
```

### Rule 2: Counselor Youth Interview [CYI]

```
When a card with name containing "CYI" is created,
add label "Counselor Youth Interview",
add member @{counselor_username},
and remove the text "CYI" from the card name.
```

### Rule 3: YSA Interview [YSAI]

```
When a card with name containing "YSAI" is created,
add label "YSA Interview",
and remove the text "YSAI" from the card name.
```

### Rule 4: Temple Recommend Interview [TRI]

```
When a card with name containing "TRI" is created,
add label "Temple Recommend",
and remove the text "TRI" from the card name.
```

---

## Future Enhancements (Out of Scope)

1. **Visit History** - Keep log of past visits (not just lastSeenAt)
2. **Auto-archive Trello cards** - Archive card when marking visited
3. **Bulk scheduling** - Schedule multiple youth at once
4. **Due dates** - Set Trello due dates automatically
5. **Leader assignment UI** - Select which leader to assign
6. **Search/filter** - Search youth by name
7. **Export** - Download queue as CSV
8. **Analytics** - Track visit frequency over time
9. **Notifications** - Slack/email when youth become overdue
10. **Multi-leader support** - Separate queues per leader

---

## Summary

**What we're building:**

- Youth visitation queue with 6-month rotation
- Trello integration for scheduling workflow
- Visit type selector with automation codes (BYI, CYI, YSAI, TRI)
- Manual sync to detect completed visits
- Card ID linking for accurate matching

**Key Technical Decisions:**

- Use ioredis (existing) instead of Vercel KV
- Use Basic Auth (existing) instead of NextAuth
- Manual sync button instead of webhooks/cron
- Hardcoded visit types in constants
- Trello card ID linking for accurate sync

**Implementation Order:**

1. Types + Constants
2. Utility functions (youth-queue, trello-youth)
3. API routes
4. Frontend components
5. Testing
6. Deployment

Ready to implement!

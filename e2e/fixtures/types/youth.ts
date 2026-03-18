export interface Youth {
  id: string;
  name: string;
  preferredName?: string;
  lastSeenAt: number;
  scheduled: boolean;
  scheduledAt?: number;
  trelloCardId?: string;
  trelloCardUrl?: string;
  visitType?: string;
  note?: string;
  createdAt: number;
}

export interface VisitHistoryItem {
  id: string;
  visitedAt: number;
  visitType: string;
  trelloUrl: string;
  note?: string;
}

export interface SyncResult {
  markedVisited: string[];
  errors: string[];
}

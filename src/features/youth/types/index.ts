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

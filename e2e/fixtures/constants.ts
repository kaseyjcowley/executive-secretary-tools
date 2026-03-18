export const REDIS_KEYS = {
  CONDUCTOR_ROTATION: "church:conductors:rotation",
  CONDUCTOR_CURRENT_INDEX: "church:conductors:currentIndex",
  CONDUCTOR_OVERRIDE: "church:conductors:override",
  TEMPLATES: "church:templates",
  TEMPLATE_PREFIX: "church:templates:",
  MESSAGED_CONTACT_PREFIX: "church:messaged:",
  YOUTH_HASH_PREFIX: "youth:",
  YOUTH_QUEUE: "youth:queue",
  YOUTH_VISITS_PREFIX: "youth:visits:",
  YOUTH_SYNCED_CARDS: "youth:syncedCards",
  YOUTH_PENDING_REVIEWS: "youth:pendingReviews",
} as const;

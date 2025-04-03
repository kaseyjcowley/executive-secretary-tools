import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is not set.");
}

// Create a single Redis instance.
// ioredis handles connection pooling and reconnection automatically.
// In serverless environments, this instance might be reused across invocations
// depending on the platform's execution context management.
const redis = new Redis(redisUrl, {
  // Optional: Configure TLS if your Redis instance requires it
  // tls: {
  //   rejectUnauthorized: false, // Adjust as needed for self-signed certs
  // },
  // Optional: Add connection retry strategies if needed
  maxRetriesPerRequest: 3,
});

redis.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export default redis;

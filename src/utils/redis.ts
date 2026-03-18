import Redis from "ioredis";

let redisUrl = process.env.REDIS_URL;

console.log("[redis] NODE_ENV:", process.env.NODE_ENV, "REDIS_URL:", redisUrl);

if (["test", "development"].includes(process.env.NODE_ENV || "") && !redisUrl) {
  redisUrl = "redis://localhost:6399";
  console.log("[redis] Using default test Redis");
}

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

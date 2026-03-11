import redis from "@/utils/redis";

async function getRedisData() {
  const keys = await redis.keys("*");

  const pipeline = redis.pipeline();
  keys.forEach((key) => pipeline.get(key));
  const results = await pipeline.exec();

  const data: Record<string, unknown> = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = results?.[i]?.[1];

    if (value === null) {
      data[key] = null;
    } else if (typeof value === "string") {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    } else {
      data[key] = value;
    }
  }

  return { keys: keys.sort(), data };
}

export default async function RedisPage() {
  const { keys, data } = await getRedisData();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Redis Database</h1>
        <p className="text-gray-400 mb-6">{keys.length} keys</p>

        <div className="space-y-6">
          {keys.map((key) => (
            <section key={key} className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-400 mb-3 break-all">
                {key}
              </h2>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(data[key], null, 2)}
              </pre>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

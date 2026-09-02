// Local stand-in for Upstash's Redis REST API, backed by a real local Redis
// (`redis-server`) — so caching/rate-limiting can be exercised and benchmarked
// end-to-end in dev without an Upstash account. Implements just the wire
// contract @upstash/redis actually uses: POST / with a JSON command array
// body (e.g. ["SET","key","value","EX","60"]), returns {"result": ...}.
// In production, UPSTASH_REDIS_REST_URL/TOKEN point at real Upstash instead —
// this file is dev tooling only, never imported by the app itself.
const http = require("http");
const Redis = require("ioredis");

const PORT = process.env.UPSTASH_SHIM_PORT || 8079;
const TOKEN = process.env.UPSTASH_SHIM_TOKEN || "dev-local-token";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redis = new Redis(REDIS_URL, { lazyConnect: true });

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

async function main() {
  await redis.connect();
  console.log(`Connected to local Redis at ${REDIS_URL}`);

  const server = http.createServer(async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405).end();
      return;
    }

    const auth = req.headers.authorization || "";
    if (auth !== `Bearer ${TOKEN}`) {
      res.writeHead(401, { "Content-Type": "application/json" }).end(
        JSON.stringify({ error: "Unauthorized" })
      );
      return;
    }

    try {
      const raw = await readBody(req);
      const parsed = JSON.parse(raw);
      const isPipeline = req.url.includes("pipeline") || req.url.includes("multi-exec");

      if (isPipeline) {
        // Body is an array of command arrays: [["SET","k","v"], ["INCR","n"], ...]
        const results = [];
        for (const command of parsed) {
          try {
            results.push({ result: await redis.call(...command.map(String)) });
          } catch (err) {
            results.push({ error: err.message });
          }
        }
        res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(results));
        return;
      }

      if (!Array.isArray(parsed)) throw new Error("Expected a command array");
      const result = await redis.call(...parsed.map(String));
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ result }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" }).end(
        JSON.stringify({ error: err.message })
      );
    }
  });

  server.listen(PORT, () => {
    console.log(`Upstash REST shim listening on http://localhost:${PORT}`);
    console.log(`Set UPSTASH_REDIS_REST_URL=http://localhost:${PORT}`);
    console.log(`Set UPSTASH_REDIS_REST_TOKEN=${TOKEN}`);
  });
}

main().catch((err) => {
  console.error("Failed to start Upstash REST shim:", err.message);
  process.exit(1);
});

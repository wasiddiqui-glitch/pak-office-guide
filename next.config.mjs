import withPWAInit from "next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  // Fewer parallel build workers -> fewer concurrent DB connection pools during
  // static generation. Matters for small/serverless Postgres instances (a local
  // `prisma dev` database, for example, suggests capping total connections at
  // 10) — see the pool `max` comment in src/lib/db.js for the other half of this.
  experimental: { cpus: 3 },
};

export default withSentryConfig(withPWA(nextConfig), {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only upload source maps / release info when a Sentry auth token is configured
  // (e.g. in CI) — keeps local `next build` fast and quiet otherwise.
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});

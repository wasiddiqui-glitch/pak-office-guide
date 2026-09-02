// Server-side Sentry init. Inert (no-op) when SENTRY_DSN isn't set — same
// optional-dependency pattern as OPENAI_API_KEY/UPSTASH_* elsewhere in this app.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  enabled: Boolean(process.env.SENTRY_DSN),
});

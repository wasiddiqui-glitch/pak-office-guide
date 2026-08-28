// Edge runtime Sentry init (middleware/edge API routes). Inert without SENTRY_DSN.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  enabled: Boolean(process.env.SENTRY_DSN),
});

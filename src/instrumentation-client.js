// Client-side Sentry init. Inert (no-op) without NEXT_PUBLIC_SENTRY_DSN — set
// this alongside SENTRY_DSN if you want browser errors reported too (it must
// be NEXT_PUBLIC_-prefixed to reach client bundles; the server DSN is not
// exposed to the browser).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

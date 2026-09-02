// Consistent error envelope + status-code mapping for all API routes.
import { ZodError } from "zod";

export class ApiError extends Error {
  /** @type {number | undefined} */
  retryAfterSeconds;

  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message, details) {
  return new ApiError(400, "BAD_REQUEST", message, details);
}

export function tooManyRequests(message, retryAfterSeconds) {
  const err = new ApiError(429, "RATE_LIMITED", message);
  err.retryAfterSeconds = retryAfterSeconds;
  return err;
}

export function upstreamError(message) {
  return new ApiError(502, "UPSTREAM_ERROR", message);
}

function envelope(code, message, details) {
  return { error: { code, message, ...(details ? { details } : {}) } };
}

/**
 * Wraps a Next.js route handler (GET/POST/...) with uniform error handling:
 * - ZodError -> 400 with field-level details
 * - ApiError -> its own status/code
 * - anything else -> 500, logged server-side, generic message to the client
 *
 * Also reports to Sentry (if configured) for 5xx responses.
 */
export function withErrorHandling(handler) {
  return async function wrapped(req, ctx) {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        return Response.json(
          envelope("VALIDATION_ERROR", "Invalid request.", err.flatten()),
          { status: 400 }
        );
      }

      if (err instanceof ApiError) {
        const headers = err.retryAfterSeconds
          ? { "Retry-After": String(err.retryAfterSeconds) }
          : undefined;
        if (err.status >= 500) reportError(err, req);
        return Response.json(envelope(err.code, err.message, err.details), {
          status: err.status,
          headers,
        });
      }

      console.error("Unhandled API error:", err);
      reportError(err, req);
      return Response.json(
        envelope("INTERNAL_ERROR", "Something went wrong."),
        { status: 500 }
      );
    }
  };
}

function reportError(err, req) {
  try {
    // Sentry is a no-op (SDK does nothing) if SENTRY_DSN isn't configured — see sentry.*.config.js.
    const Sentry = require("@sentry/nextjs");
    Sentry.captureException(err, {
      extra: { url: req?.url },
    });
  } catch {
    // Sentry not installed/available in this environment — ignore.
  }
}

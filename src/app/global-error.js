"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import NextError from "next/error";

export default function GlobalError({ error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* Next's default error page — keeps this file minimal since it can't
            use the app's normal layout (it replaces the root layout on crash). */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}

import { z } from "zod";

// Coerces query-string values ("1", "20") into numbers with sane bounds/defaults.
const pageSchema = z.coerce.number().int().min(1).max(100000).default(1);
const pageSizeSchema = z.coerce.number().int().min(1).max(50).default(20);

const trimmedString = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v.length ? v : undefined))
    .optional();

export const searchQuerySchema = z.object({
  q: trimmedString(200),
  city: trimmedString(100),
  category: trimmedString(100),
  area: trimmedString(100),
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const aiSearchBodySchema = z.object({
  query: z.string().trim().min(1, "Query is required.").max(200, "Query is too long."),
});

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().trim().min(1).max(2000),
});

export const chatBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "Messages are required."),
});

/** Parses a Next.js `Request`'s search params against a Zod schema. */
export function parseSearchParams(req, schema) {
  const url = new URL(req.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  return schema.parse(raw);
}

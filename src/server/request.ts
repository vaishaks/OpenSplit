import type { NextRequest } from "next/server";
import type { ZodSchema } from "zod";
import { HttpError } from "@/server/errors";

export async function parseBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  return parsed.data;
}

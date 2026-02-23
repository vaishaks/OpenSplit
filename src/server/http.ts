import { NextResponse } from "next/server";
import { HttpError } from "@/server/errors";
import { logError } from "@/server/logger";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(error: unknown, requestId?: string) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      {
        error: error.message,
        requestId
      },
      { status: error.status }
    );
  }

  logError("api.unhandled", {
    requestId,
    message: error instanceof Error ? error.message : "Unknown error"
  });

  return NextResponse.json(
    {
      error: "Internal server error",
      requestId
    },
    { status: 500 }
  );
}

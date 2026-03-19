import { NextResponse } from "next/server";

import type { ApiFailure, ApiSuccess } from "@/types/api/common";

export function ok<T>(data: T, status = 200) {
  const payload: ApiSuccess<T> = {
    success: true,
    data,
  };

  return NextResponse.json(payload, { status });
}

export function fail(
  code: string,
  message: string,
  status: number,
  details?: unknown
) {
  const payload: ApiFailure = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };

  return NextResponse.json(payload, { status });
}

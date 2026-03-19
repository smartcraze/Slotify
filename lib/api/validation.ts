import type { NextRequest } from "next/server";
import { z } from "zod";

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: NextRequest,
  schema: TSchema
): Promise<
  | { success: true; data: z.infer<TSchema> }
  | { success: false; details: ReturnType<typeof formatZodError> }
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      details: [{ path: "body", message: "Invalid JSON body" }],
    };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      details: formatZodError(parsed.error),
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}

export function parseQuery<TSchema extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: TSchema
):
  | { success: true; data: z.infer<TSchema> }
  | { success: false; details: ReturnType<typeof formatZodError> } {
  const rawObject = Object.fromEntries(searchParams.entries());
  const parsed = schema.safeParse(rawObject);

  if (!parsed.success) {
    return {
      success: false,
      details: formatZodError(parsed.error),
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}

export function parseParams<TSchema extends z.ZodTypeAny>(
  params: unknown,
  schema: TSchema
):
  | { success: true; data: z.infer<TSchema> }
  | { success: false; details: ReturnType<typeof formatZodError> } {
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    return {
      success: false,
      details: formatZodError(parsed.error),
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}

export function isPrismaUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

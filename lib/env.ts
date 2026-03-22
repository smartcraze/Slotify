import "server-only";

import { z } from "zod";

const appEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required").optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required").optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, "RAZORPAY_WEBHOOK_SECRET is required").optional(),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required").optional(),
  RESEND_FROM_EMAIL: z.string().min(1, "RESEND_FROM_EMAIL is required").optional(),
  RESEND_WEBHOOK_SECRET: z.string().min(1, "RESEND_WEBHOOK_SECRET is required").optional(),
});

function parseEnv<T extends z.ZodTypeAny>(schema: T, label: string): z.infer<T> {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid ${label} environment configuration:\n${issues}`);
  }

  return parsed.data;
}

export const env = parseEnv(appEnvSchema, "application");

export const REQUIRED_ENV_KEYS = [
  ...Object.keys(appEnvSchema.shape),
] as const;

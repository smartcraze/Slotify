import { z } from "zod";

export const cuidSchema = z.string().cuid();

export const isoUtcDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .refine((value) => value.endsWith("Z"), {
    message: "Datetime must be in UTC and end with Z",
  });

export const ymdDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Date must be YYYY-MM-DD",
});

export const ianaTimeZoneSchema = z.string().min(1, {
  message: "Timezone is required",
});

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

import { z } from "zod";

export const signUpBodySchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(128),
    name: z.string().trim().min(1).max(80).optional(),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]{3,32}$/)
      .optional(),
  })
  .strict();

export type SignUpBody = z.infer<typeof signUpBodySchema>;

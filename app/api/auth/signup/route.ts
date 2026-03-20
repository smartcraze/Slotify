import type { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { hashPassword } from "@/lib/auth/password";
import { buildAvailableUsername } from "@/lib/auth/username";
import { prisma } from "@/lib/prisma";
import { signUpBodySchema } from "@/types/api/auth";

export async function POST(request: NextRequest) {
  const parsedBody = await parseJsonBody(request, signUpBodySchema);

  if (!parsedBody.success) {
    return fail("BAD_REQUEST", "Invalid request body", 400, parsedBody.details);
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: parsedBody.data.email },
    select: { id: true },
  });

  if (existingByEmail) {
    return fail("CONFLICT", "An account with this email already exists", 409);
  }

  const requestedUsername = parsedBody.data.username;

  if (requestedUsername) {
    const existingByUsername = await prisma.user.findUnique({
      where: { username: requestedUsername },
      select: { id: true },
    });

    if (existingByUsername) {
      return fail("CONFLICT", "This username is already taken", 409);
    }
  }

  const passwordHash = await hashPassword(parsedBody.data.password);
  const username = requestedUsername
    ? requestedUsername
    : await buildAvailableUsername(
        parsedBody.data.email.split("@")[0] || parsedBody.data.name || "user"
      );

  const user = await prisma.user.create({
    data: {
      email: parsedBody.data.email,
      passwordHash,
      username,
      name: parsedBody.data.name,
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
    },
  });

  return ok(user, 201);
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

function normalizeUsernameBase(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);

  return normalized || "user";
}

async function assignUsernameIfMissing(args: {
  userId?: string;
  email?: string | null;
  name?: string | null;
}) {
  if (!args.userId) {
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: args.userId },
    select: { username: true },
  });

  if (!existingUser || existingUser.username) {
    return;
  }

  const emailLocalPart = args.email?.split("@")[0];
  const baseUsername = normalizeUsernameBase(emailLocalPart || args.name || "user");

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? baseUsername : `${baseUsername}-${index}`;
    const usedByAnother = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (usedByAnother) {
      continue;
    }

    await prisma.user.update({
      where: { id: args.userId },
      data: { username: candidate },
    });

    return;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            passwordHash: true,
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValidPassword = await verifyPassword(password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    async signIn({ user }) {
      await assignUsernameIfMissing({
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) {
          return url;
        }
      } catch {
        return baseUrl;
      }

      return baseUrl;
    },
  },
};

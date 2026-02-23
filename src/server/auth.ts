import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { z } from "zod";
import { prisma } from "@/server/db";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
  }

  interface User {
    id: string;
  }
}

const testCredentialsSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional()
});

const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID ?? "",
    clientSecret: process.env.AUTH_GOOGLE_SECRET ?? ""
  })
];

if (process.env.OPENSPLIT_TEST_MODE === "true") {
  providers.push(
    Credentials({
      name: "Test Login",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" }
      },
      async authorize(rawCredentials) {
        const parsed = testCredentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.upsert({
          where: { email: parsed.data.email },
          update: { name: parsed.data.name ?? "Test User" },
          create: {
            email: parsed.data.email,
            name: parsed.data.name ?? "Test User",
            avatarUrl: null
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "Test User",
          image: user.avatarUrl
        };
      }
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "opensplit-dev-only-secret"),
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const email = user.email;
      if (!email) {
        return false;
      }

      const googleSub =
        account?.provider === "google" && typeof profile?.sub === "string"
          ? profile.sub
          : undefined;

      const dbUser = await prisma.user.upsert({
        where: { email },
        update: {
          name: user.name,
          avatarUrl: user.image,
          ...(googleSub ? { googleSub } : {})
        },
        create: {
          email,
          name: user.name,
          avatarUrl: user.image,
          googleSub
        }
      });

      user.id = dbUser.id;
      return true;
    },
    async jwt({ token, user }) {
      const mutableToken = token as typeof token & { userId?: string };

      if (user?.id) {
        mutableToken.userId = user.id;
      }

      if (!mutableToken.userId && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true }
        });
        mutableToken.userId = dbUser?.id;
      }

      return mutableToken;
    },
    async session({ session, token }) {
      const tokenWithUserId = token as typeof token & { userId?: unknown };
      if (session.user && typeof tokenWithUserId.userId === "string") {
        session.user.id = tokenWithUserId.userId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/"
  },
  trustHost: true
});

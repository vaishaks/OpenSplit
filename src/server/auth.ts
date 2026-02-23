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

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
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
      if (user?.id) {
        token.userId = user.id;
      }

      if (!token.userId && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true }
        });
        token.userId = dbUser?.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/"
  },
  trustHost: true
});

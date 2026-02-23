import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { HttpError } from "@/server/errors";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new HttpError(401, "Unauthorized");
  }
  return session.user;
}

export async function requireActiveMembership(groupId: string, userId: string) {
  const member = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
      status: "ACTIVE"
    }
  });

  if (!member) {
    throw new HttpError(403, "Forbidden");
  }

  return member;
}

export async function requireGroupOwner(groupId: string, userId: string) {
  const member = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
      status: "ACTIVE",
      role: "OWNER"
    }
  });

  if (!member) {
    throw new HttpError(403, "Owner role required");
  }

  return member;
}

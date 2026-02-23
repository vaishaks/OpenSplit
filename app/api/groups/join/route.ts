import { type NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";
import { joinGroupSchema } from "@/server/schemas";
import { parseBody } from "@/server/request";
import { ok, fail } from "@/server/http";
import { HttpError } from "@/server/errors";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const user = await requireUser();
    const body = await parseBody(request, joinGroupSchema);

    const now = new Date();

    const emailInvite = await prisma.groupInvite.findFirst({
      where: {
        token: body.token,
        expiresAt: { gt: now }
      },
      include: {
        group: true
      }
    });

    const group = emailInvite?.group
      ? emailInvite.group
      : await prisma.group.findUnique({
          where: { inviteCode: body.token }
        });

    if (!group) {
      throw new HttpError(404, "Invite not found or expired");
    }

    if (group.isArchived) {
      throw new HttpError(400, "Group is archived");
    }

    if (emailInvite?.email && emailInvite.email.toLowerCase() !== user.email?.toLowerCase()) {
      throw new HttpError(403, "Invite email does not match signed in account");
    }

    if (emailInvite?.acceptedAt) {
      throw new HttpError(400, "Invite already used");
    }

    const membership = await prisma.groupMember.upsert({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: user.id
        }
      },
      update: {
        status: "ACTIVE",
        joinedAt: new Date()
      },
      create: {
        groupId: group.id,
        userId: user.id,
        role: "MEMBER",
        status: "ACTIVE",
        joinedAt: new Date()
      }
    });

    if (emailInvite) {
      await prisma.groupInvite.update({
        where: { id: emailInvite.id },
        data: {
          acceptedAt: new Date()
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        groupId: group.id,
        entityType: "group_member",
        entityId: membership.id,
        action: "joined"
      }
    });

    return ok({ groupId: group.id });
  } catch (error) {
    return fail(error, requestId);
  }
}

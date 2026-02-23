import { type NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { requireUser, requireGroupOwner } from "@/server/guards";
import { createInviteSchema } from "@/server/schemas";
import { parseBody } from "@/server/request";
import { ok, fail } from "@/server/http";
import { HttpError } from "@/server/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const { groupId } = params;
    const user = await requireUser();
    await requireGroupOwner(groupId, user.id);

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, inviteCode: true, isArchived: true }
    });

    if (!group) {
      throw new HttpError(404, "Group not found");
    }

    if (group.isArchived) {
      throw new HttpError(400, "Group is archived");
    }

    const body = await parseBody(request, createInviteSchema);

    if (!body.email) {
      return ok({
        token: group.inviteCode,
        inviteUrl: `${request.nextUrl.origin}/invite/${group.inviteCode}`,
        type: "link"
      });
    }

    const invite = await prisma.groupInvite.create({
      data: {
        groupId,
        email: body.email,
        token: crypto.randomUUID().replace(/-/g, ""),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        createdByUserId: user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        groupId,
        entityType: "group_invite",
        entityId: invite.id,
        action: "created",
        metadataJson: {
          email: body.email
        }
      }
    });

    return ok(
      {
        token: invite.token,
        inviteUrl: `${request.nextUrl.origin}/invite/${invite.token}`,
        type: "email"
      },
      201
    );
  } catch (error) {
    return fail(error, requestId);
  }
}

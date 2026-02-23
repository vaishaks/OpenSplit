import { type NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";
import { createGroupSchema } from "@/server/schemas";
import { parseBody } from "@/server/request";
import { ok, fail } from "@/server/http";
import { getGroupBalances } from "@/server/group-balances";
import { logInfo } from "@/server/logger";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const user = await requireUser();
    const body = await parseBody(request, createGroupSchema);

    const group = await prisma.$transaction(async (tx) => {
      const created = await tx.group.create({
        data: {
          name: body.name,
          currencyCode: body.currencyCode,
          createdByUserId: user.id,
          inviteCode: crypto.randomUUID().replace(/-/g, "")
        }
      });

      await tx.groupMember.create({
        data: {
          groupId: created.id,
          userId: user.id,
          role: "OWNER",
          status: "ACTIVE",
          joinedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          groupId: created.id,
          entityType: "group",
          entityId: created.id,
          action: "created"
        }
      });

      return created;
    });

    logInfo("group.created", {
      requestId,
      groupId: group.id,
      actorUserId: user.id
    });

    return ok({ group }, 201);
  } catch (error) {
    return fail(error, requestId);
  }
}

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const user = await requireUser();

    const memberships = await prisma.groupMember.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE"
      },
      include: {
        group: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const balances = await getGroupBalances(membership.groupId);
        const mine = balances.balances.find((item) => item.member?.userId === user.id);

        return {
          id: membership.group.id,
          name: membership.group.name,
          currencyCode: membership.group.currencyCode,
          isArchived: membership.group.isArchived,
          myNetCents: mine?.netCents ?? 0,
          role: membership.role
        };
      })
    );

    return ok({ groups });
  } catch (error) {
    return fail(error, requestId);
  }
}

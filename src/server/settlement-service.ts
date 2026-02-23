import type { PrismaClient } from "@prisma/client";
import { HttpError } from "@/server/errors";

export async function createSettlement(params: {
  prisma: PrismaClient;
  groupId: string;
  createdByUserId: string;
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
  note?: string;
  paidAt?: string;
}) {
  if (params.fromMemberId === params.toMemberId) {
    throw new HttpError(400, "Settlement participants must be different");
  }

  if (params.amountCents <= 0) {
    throw new HttpError(400, "Settlement amount must be positive");
  }

  const group = await params.prisma.group.findUnique({
    where: { id: params.groupId },
    select: { id: true, isArchived: true }
  });

  if (!group) {
    throw new HttpError(404, "Group not found");
  }

  if (group.isArchived) {
    throw new HttpError(400, "Group is archived");
  }

  const members = await params.prisma.groupMember.findMany({
    where: {
      groupId: params.groupId,
      status: "ACTIVE",
      id: {
        in: [params.fromMemberId, params.toMemberId]
      }
    },
    select: { id: true }
  });

  if (members.length !== 2) {
    throw new HttpError(400, "Settlement members must belong to the group");
  }

  return params.prisma.$transaction(async (tx) => {
    const settlement = await tx.settlement.create({
      data: {
        groupId: params.groupId,
        fromMemberId: params.fromMemberId,
        toMemberId: params.toMemberId,
        amountCents: params.amountCents,
        note: params.note,
        paidAt: params.paidAt ? new Date(params.paidAt) : new Date(),
        createdByUserId: params.createdByUserId
      }
    });

    await tx.auditLog.create({
      data: {
        actorUserId: params.createdByUserId,
        groupId: params.groupId,
        entityType: "settlement",
        entityId: settlement.id,
        action: "created",
        metadataJson: {
          amountCents: params.amountCents
        }
      }
    });

    return settlement;
  });
}

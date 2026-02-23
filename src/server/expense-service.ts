import type { PrismaClient, SplitType } from "@prisma/client";
import { HttpError } from "@/server/errors";
import { calculateSplit, type SplitParticipantInput } from "@/server/splits";

export async function createExpense(params: {
  prisma: PrismaClient;
  groupId: string;
  createdByUserId: string;
  title: string;
  notes?: string;
  amountCents: number;
  paidByMemberId: string;
  participantMemberIds: string[];
  splitType: SplitType;
  splitParticipants?: SplitParticipantInput[];
  spentAt?: string;
}) {
  const group = await params.prisma.group.findUnique({
    where: { id: params.groupId },
    select: {
      id: true,
      isArchived: true,
      currencyCode: true
    }
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
      status: "ACTIVE"
    },
    select: {
      id: true,
      userId: true
    }
  });

  const memberIdSet = new Set(members.map((member) => member.id));
  if (!memberIdSet.has(params.paidByMemberId)) {
    throw new HttpError(400, "Payer must be an active group member");
  }

  for (const participantId of params.participantMemberIds) {
    if (!memberIdSet.has(participantId)) {
      throw new HttpError(400, "All participants must be active group members");
    }
  }

  if (!params.participantMemberIds.includes(params.paidByMemberId)) {
    throw new HttpError(400, "Payer must be included in participants");
  }

  const splitRows = calculateSplit(
    params.splitType,
    params.amountCents,
    params.participantMemberIds,
    params.splitParticipants
  );

  return params.prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        groupId: params.groupId,
        title: params.title,
        notes: params.notes,
        amountCents: params.amountCents,
        currencyCode: group.currencyCode,
        paidByMemberId: params.paidByMemberId,
        splitType: params.splitType,
        spentAt: params.spentAt ? new Date(params.spentAt) : new Date(),
        createdByUserId: params.createdByUserId,
        participants: {
          createMany: {
            data: splitRows.map((row) => ({
              memberId: row.memberId,
              amountCents: row.amountCents,
              percentageBps: row.percentageBps,
              shareUnits: row.shareUnits
            }))
          }
        }
      },
      include: {
        participants: true
      }
    });

    await tx.auditLog.create({
      data: {
        actorUserId: params.createdByUserId,
        groupId: params.groupId,
        entityType: "expense",
        entityId: expense.id,
        action: "created",
        metadataJson: {
          splitType: params.splitType,
          amountCents: params.amountCents
        }
      }
    });

    return expense;
  });
}

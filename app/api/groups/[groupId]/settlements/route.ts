import { type NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { requireUser, requireActiveMembership } from "@/server/guards";
import { createSettlementSchema } from "@/server/schemas";
import { parseBody } from "@/server/request";
import { ok, fail } from "@/server/http";
import { createSettlement } from "@/server/settlement-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const { groupId } = params;
    const user = await requireUser();
    await requireActiveMembership(groupId, user.id);

    const settlements = await prisma.settlement.findMany({
      where: { groupId },
      orderBy: { paidAt: "desc" },
      include: {
        fromMember: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        toMember: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    return ok({ settlements });
  } catch (error) {
    return fail(error, requestId);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const { groupId } = params;
    const user = await requireUser();
    await requireActiveMembership(groupId, user.id);

    const body = await parseBody(request, createSettlementSchema);

    const settlement = await createSettlement({
      prisma,
      groupId,
      createdByUserId: user.id,
      fromMemberId: body.fromMemberId,
      toMemberId: body.toMemberId,
      amountCents: body.amountCents,
      note: body.note,
      paidAt: body.paidAt
    });

    return ok({ settlement }, 201);
  } catch (error) {
    return fail(error, requestId);
  }
}

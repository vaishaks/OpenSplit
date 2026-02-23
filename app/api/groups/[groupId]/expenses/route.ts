import { type NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { requireUser, requireActiveMembership } from "@/server/guards";
import { createExpenseSchema } from "@/server/schemas";
import { parseBody } from "@/server/request";
import { ok, fail } from "@/server/http";
import { createExpense } from "@/server/expense-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const { groupId } = params;
    const user = await requireUser();
    await requireActiveMembership(groupId, user.id);

    const page = Number.parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
    const limit = Math.min(
      Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10),
      50
    );
    const skip = Math.max(0, (Math.max(1, page) - 1) * limit);

    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where: { groupId },
        orderBy: { spentAt: "desc" },
        skip,
        take: limit,
        include: {
          paidByMember: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          participants: {
            include: {
              member: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.expense.count({
        where: { groupId }
      })
    ]);

    return ok({
      items,
      page,
      limit,
      total
    });
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

    const body = await parseBody(request, createExpenseSchema);

    const expense = await createExpense({
      prisma,
      groupId,
      createdByUserId: user.id,
      title: body.title,
      notes: body.notes,
      amountCents: body.amountCents,
      paidByMemberId: body.paidByMemberId,
      participantMemberIds: body.participantMemberIds,
      splitType: body.splitType,
      splitParticipants: body.splitParticipants,
      spentAt: body.spentAt
    });

    return ok({ expense }, 201);
  } catch (error) {
    return fail(error, requestId);
  }
}

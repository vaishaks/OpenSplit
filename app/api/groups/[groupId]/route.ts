import { type NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { requireUser, requireActiveMembership } from "@/server/guards";
import { ok, fail } from "@/server/http";
import { HttpError } from "@/server/errors";
import { getGroupBalances } from "@/server/group-balances";
import { createHeroSeed } from "@/lib/visual-seed";
import { summarizeCounterparty } from "@/server/group-summary";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const { groupId } = await params;
    const user = await requireUser();
    const membership = await requireActiveMembership(groupId, user.id);

    const [group, balances] = await Promise.all([
      prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: {
            where: { status: "ACTIVE" },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true
                }
              }
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        }
      }),
      getGroupBalances(groupId)
    ]);

    if (!group) {
      throw new HttpError(404, "Group not found");
    }

    const counterpartySummary = summarizeCounterparty({
      myMemberId: membership.id,
      balances: balances.balances,
      suggestions: balances.suggestions
    });

    return ok({
      group: {
        ...group,
        memberCount: balances.memberCount,
        activityRange: balances.activityRange,
        heroSeed: createHeroSeed(group.id, group.name),
        counterpartySummary
      }
    });
  } catch (error) {
    return fail(error, requestId);
  }
}

import { type NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { requireUser, requireActiveMembership } from "@/server/guards";
import { ok, fail } from "@/server/http";
import { HttpError } from "@/server/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const { groupId } = params;
    const user = await requireUser();
    await requireActiveMembership(groupId, user.id);

    const group = await prisma.group.findUnique({
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
    });

    if (!group) {
      throw new HttpError(404, "Group not found");
    }

    return ok({ group });
  } catch (error) {
    return fail(error, requestId);
  }
}

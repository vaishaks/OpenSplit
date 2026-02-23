import { type NextRequest } from "next/server";
import { requireUser, requireActiveMembership } from "@/server/guards";
import { ok, fail } from "@/server/http";
import { getGroupBalances } from "@/server/group-balances";

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const requestId = request.headers.get("x-request-id") ?? undefined;

  try {
    const { groupId } = params;
    const user = await requireUser();
    await requireActiveMembership(groupId, user.id);

    const balances = await getGroupBalances(groupId);

    return ok(balances);
  } catch (error) {
    return fail(error, requestId);
  }
}

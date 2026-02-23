import { prisma } from "@/server/db";
import { computeGroupNetBalances, suggestSettlements } from "@/server/ledger";

export async function getGroupBalances(groupId: string) {
  const [members, expenses, settlements] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId, status: "ACTIVE" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    }),
    prisma.expense.findMany({
      where: { groupId },
      include: {
        participants: true
      }
    }),
    prisma.settlement.findMany({
      where: { groupId }
    })
  ]);

  const nets = computeGroupNetBalances({
    members,
    expenses,
    settlements
  });

  const suggestions = suggestSettlements(nets);

  const memberById = new Map(
    members.map((member) => [
      member.id,
      {
        memberId: member.id,
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        avatarUrl: member.user.avatarUrl
      }
    ])
  );

  return {
    balances: nets.map((item) => ({
      ...item,
      member: memberById.get(item.memberId)
    })),
    suggestions: suggestions.map((item) => ({
      ...item,
      fromMember: memberById.get(item.fromMemberId),
      toMember: memberById.get(item.toMemberId)
    }))
  };
}

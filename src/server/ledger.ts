import type { Expense, ExpenseParticipant, GroupMember, Settlement } from "@prisma/client";

export type MemberNet = {
  memberId: string;
  netCents: number;
};

export type SuggestedSettlement = {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
};

type ExpenseWithParticipants = Expense & { participants: ExpenseParticipant[] };

export function computeGroupNetBalances(params: {
  members: GroupMember[];
  expenses: ExpenseWithParticipants[];
  settlements: Settlement[];
}): MemberNet[] {
  const balances = new Map<string, number>();

  for (const member of params.members) {
    if (member.status !== "ACTIVE") {
      continue;
    }
    balances.set(member.id, 0);
  }

  for (const expense of params.expenses) {
    balances.set(expense.paidByMemberId, (balances.get(expense.paidByMemberId) ?? 0) + expense.amountCents);

    for (const participant of expense.participants) {
      balances.set(
        participant.memberId,
        (balances.get(participant.memberId) ?? 0) - participant.amountCents
      );
    }
  }

  for (const settlement of params.settlements) {
    balances.set(
      settlement.fromMemberId,
      (balances.get(settlement.fromMemberId) ?? 0) + settlement.amountCents
    );
    balances.set(
      settlement.toMemberId,
      (balances.get(settlement.toMemberId) ?? 0) - settlement.amountCents
    );
  }

  return Array.from(balances.entries())
    .map(([memberId, netCents]) => ({ memberId, netCents }))
    .sort((a, b) => a.memberId.localeCompare(b.memberId));
}

export function suggestSettlements(nets: MemberNet[]): SuggestedSettlement[] {
  const debtors = nets
    .filter((item) => item.netCents < 0)
    .map((item) => ({ ...item, remaining: -item.netCents }))
    .sort((a, b) => a.memberId.localeCompare(b.memberId));

  const creditors = nets
    .filter((item) => item.netCents > 0)
    .map((item) => ({ ...item, remaining: item.netCents }))
    .sort((a, b) => a.memberId.localeCompare(b.memberId));

  const results: SuggestedSettlement[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];

    const amount = Math.min(debtor.remaining, creditor.remaining);

    if (amount > 0) {
      results.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amountCents: amount
      });
    }

    debtor.remaining -= amount;
    creditor.remaining -= amount;

    if (debtor.remaining === 0) {
      d += 1;
    }
    if (creditor.remaining === 0) {
      c += 1;
    }
  }

  return results;
}

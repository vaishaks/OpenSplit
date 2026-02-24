type ExpenseImpactInput = {
  amountCents: number;
  paidByMemberId: string;
  participants: Array<{ memberId: string; amountCents: number }>;
  currentMemberId: string;
};

export function computeExpenseImpact(params: ExpenseImpactInput): {
  myDeltaCents: number;
  myDirection: "LENT" | "BORROWED" | "NEUTRAL";
} {
  const paid = params.paidByMemberId === params.currentMemberId ? params.amountCents : 0;
  const myShare =
    params.participants.find((participant) => participant.memberId === params.currentMemberId)
      ?.amountCents ?? 0;
  const myDeltaCents = paid - myShare;

  if (myDeltaCents > 0) {
    return { myDeltaCents, myDirection: "LENT" };
  }
  if (myDeltaCents < 0) {
    return { myDeltaCents, myDirection: "BORROWED" };
  }
  return { myDeltaCents, myDirection: "NEUTRAL" };
}

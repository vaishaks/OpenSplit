import type { BalanceItem, SuggestedSettlement } from "@/lib/types";

export type QuickSettleRow = {
  memberId: string;
  name: string;
  direction: "YOU_OWE" | "OWES_YOU" | "SETTLED";
  amountCents: number;
  fromMemberId?: string;
  toMemberId?: string;
  isActionable: boolean;
};

export function buildQuickSettleRows(params: {
  balances: BalanceItem[];
  suggestions: SuggestedSettlement[];
  myMemberId: string;
}): QuickSettleRow[] {
  const signedByCounterparty = new Map<string, number>();

  for (const suggestion of params.suggestions) {
    if (suggestion.toMemberId === params.myMemberId) {
      signedByCounterparty.set(
        suggestion.fromMemberId,
        (signedByCounterparty.get(suggestion.fromMemberId) ?? 0) + suggestion.amountCents
      );
    }

    if (suggestion.fromMemberId === params.myMemberId) {
      signedByCounterparty.set(
        suggestion.toMemberId,
        (signedByCounterparty.get(suggestion.toMemberId) ?? 0) - suggestion.amountCents
      );
    }
  }

  const rows = params.balances
    .filter((balance) => balance.memberId !== params.myMemberId)
    .map((balance) => {
      const signed = signedByCounterparty.get(balance.memberId) ?? 0;
      const name = balance.member?.name || balance.member?.email || "Group member";

      if (signed > 0) {
        return {
          memberId: balance.memberId,
          name,
          direction: "OWES_YOU" as const,
          amountCents: signed,
          fromMemberId: balance.memberId,
          toMemberId: params.myMemberId,
          isActionable: true
        };
      }

      if (signed < 0) {
        return {
          memberId: balance.memberId,
          name,
          direction: "YOU_OWE" as const,
          amountCents: Math.abs(signed),
          fromMemberId: params.myMemberId,
          toMemberId: balance.memberId,
          isActionable: true
        };
      }

      return {
        memberId: balance.memberId,
        name,
        direction: "SETTLED" as const,
        amountCents: 0,
        isActionable: false
      };
    })
    .sort((left, right) => {
      if (left.isActionable !== right.isActionable) {
        return left.isActionable ? -1 : 1;
      }
      if (right.amountCents !== left.amountCents) {
        return right.amountCents - left.amountCents;
      }
      return left.name.localeCompare(right.name);
    });

  return rows;
}

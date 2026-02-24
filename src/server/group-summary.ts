import type { CounterpartySummaryDirection } from "@/lib/types";

type MemberRef = {
  memberId: string;
  name: string | null;
  email: string;
};

type SuggestedSettlementRef = {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
  fromMember?: MemberRef;
  toMember?: MemberRef;
};

type BalanceRef = {
  memberId: string;
  netCents: number;
  member?: MemberRef;
};

export function summarizeCounterparty(params: {
  myMemberId: string;
  balances: BalanceRef[];
  suggestions: SuggestedSettlementRef[];
}): {
  direction: CounterpartySummaryDirection;
  amountCents: number;
  name: string;
} {
  const mine = params.balances.find((item) => item.memberId === params.myMemberId);
  const myNet = mine?.netCents ?? 0;

  if (myNet === 0) {
    return {
      direction: "SETTLED",
      amountCents: 0,
      name: "All settled"
    };
  }

  if (myNet > 0) {
    const candidate = params.suggestions
      .filter((item) => item.toMemberId === params.myMemberId)
      .sort((a, b) => b.amountCents - a.amountCents)[0];

    if (candidate) {
      return {
        direction: "OWED",
        amountCents: candidate.amountCents,
        name: candidate.fromMember?.name || candidate.fromMember?.email || "Group member"
      };
    }
  }

  if (myNet < 0) {
    const candidate = params.suggestions
      .filter((item) => item.fromMemberId === params.myMemberId)
      .sort((a, b) => b.amountCents - a.amountCents)[0];

    if (candidate) {
      return {
        direction: "OWE",
        amountCents: candidate.amountCents,
        name: candidate.toMember?.name || candidate.toMember?.email || "Group member"
      };
    }
  }

  const counterpart = params.balances
    .filter((item) => item.memberId !== params.myMemberId && item.netCents !== 0)
    .sort((a, b) => Math.abs(b.netCents) - Math.abs(a.netCents))[0];

  if (!counterpart) {
    return {
      direction: "SETTLED",
      amountCents: 0,
      name: "All settled"
    };
  }

  return {
    direction: myNet > 0 ? "OWED" : "OWE",
    amountCents: Math.abs(counterpart.netCents),
    name: counterpart.member?.name || counterpart.member?.email || "Group member"
  };
}

import { describe, expect, it } from "vitest";
import { computeGroupNetBalances, suggestSettlements } from "../../src/server/ledger";

describe("ledger", () => {
  it("computes net balances from expenses and settlements", () => {
    const nets = computeGroupNetBalances({
      members: [
        { id: "m1", status: "ACTIVE" },
        { id: "m2", status: "ACTIVE" },
        { id: "m3", status: "ACTIVE" }
      ] as never,
      expenses: [
        {
          paidByMemberId: "m1",
          amountCents: 900,
          participants: [
            { memberId: "m1", amountCents: 300 },
            { memberId: "m2", amountCents: 300 },
            { memberId: "m3", amountCents: 300 }
          ]
        }
      ] as never,
      settlements: [
        {
          fromMemberId: "m2",
          toMemberId: "m1",
          amountCents: 100
        }
      ] as never
    });

    expect(nets).toEqual([
      { memberId: "m1", netCents: 500 },
      { memberId: "m2", netCents: -200 },
      { memberId: "m3", netCents: -300 }
    ]);
  });

  it("suggests greedy settlements", () => {
    const suggestions = suggestSettlements([
      { memberId: "a", netCents: -400 },
      { memberId: "b", netCents: -100 },
      { memberId: "c", netCents: 300 },
      { memberId: "d", netCents: 200 }
    ]);

    expect(suggestions).toEqual([
      { fromMemberId: "a", toMemberId: "c", amountCents: 300 },
      { fromMemberId: "a", toMemberId: "d", amountCents: 100 },
      { fromMemberId: "b", toMemberId: "d", amountCents: 100 }
    ]);
  });
});

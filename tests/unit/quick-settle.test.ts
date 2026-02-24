import { describe, expect, it } from "vitest";
import { buildQuickSettleRows } from "../../src/lib/quick-settle";

describe("buildQuickSettleRows", () => {
  it("builds rows where I owe and where I am owed", () => {
    const rows = buildQuickSettleRows({
      myMemberId: "me",
      balances: [
        { memberId: "me", netCents: -100 },
        { memberId: "a", netCents: 200, member: { memberId: "a", userId: "ua", name: "Alex", email: "a@test", avatarUrl: null } },
        { memberId: "b", netCents: -100, member: { memberId: "b", userId: "ub", name: "Bea", email: "b@test", avatarUrl: null } }
      ],
      suggestions: [
        { fromMemberId: "me", toMemberId: "a", amountCents: 200 },
        { fromMemberId: "b", toMemberId: "me", amountCents: 100 }
      ]
    });

    expect(rows).toEqual([
      {
        memberId: "a",
        name: "Alex",
        direction: "YOU_OWE",
        amountCents: 200,
        fromMemberId: "me",
        toMemberId: "a",
        isActionable: true
      },
      {
        memberId: "b",
        name: "Bea",
        direction: "OWES_YOU",
        amountCents: 100,
        fromMemberId: "b",
        toMemberId: "me",
        isActionable: true
      }
    ]);
  });

  it("marks member as settled when no suggestion exists", () => {
    const rows = buildQuickSettleRows({
      myMemberId: "me",
      balances: [
        { memberId: "me", netCents: 0 },
        { memberId: "a", netCents: 0, member: { memberId: "a", userId: "ua", name: "Alex", email: "a@test", avatarUrl: null } }
      ],
      suggestions: []
    });

    expect(rows).toEqual([
      {
        memberId: "a",
        name: "Alex",
        direction: "SETTLED",
        amountCents: 0,
        isActionable: false
      }
    ]);
  });

  it("aggregates multiple suggestions for same member", () => {
    const rows = buildQuickSettleRows({
      myMemberId: "me",
      balances: [
        { memberId: "me", netCents: 0 },
        { memberId: "a", netCents: 0, member: { memberId: "a", userId: "ua", name: "Alex", email: "a@test", avatarUrl: null } }
      ],
      suggestions: [
        { fromMemberId: "a", toMemberId: "me", amountCents: 100 },
        { fromMemberId: "a", toMemberId: "me", amountCents: 40 }
      ]
    });

    expect(rows[0]?.amountCents).toBe(140);
    expect(rows[0]?.direction).toBe("OWES_YOU");
  });
});

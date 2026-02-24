import { describe, expect, it } from "vitest";
import { computeExpenseImpact } from "../../src/server/expense-impact";

describe("computeExpenseImpact", () => {
  it("returns lent when user paid more than share", () => {
    const result = computeExpenseImpact({
      amountCents: 1200,
      paidByMemberId: "m1",
      currentMemberId: "m1",
      participants: [
        { memberId: "m1", amountCents: 400 },
        { memberId: "m2", amountCents: 400 },
        { memberId: "m3", amountCents: 400 }
      ]
    });

    expect(result).toEqual({ myDeltaCents: 800, myDirection: "LENT" });
  });

  it("returns borrowed when user did not pay and has share", () => {
    const result = computeExpenseImpact({
      amountCents: 1000,
      paidByMemberId: "m2",
      currentMemberId: "m1",
      participants: [
        { memberId: "m1", amountCents: 500 },
        { memberId: "m2", amountCents: 500 }
      ]
    });

    expect(result).toEqual({ myDeltaCents: -500, myDirection: "BORROWED" });
  });

  it("returns neutral when user paid exactly their own share", () => {
    const result = computeExpenseImpact({
      amountCents: 300,
      paidByMemberId: "m1",
      currentMemberId: "m1",
      participants: [{ memberId: "m1", amountCents: 300 }]
    });

    expect(result).toEqual({ myDeltaCents: 0, myDirection: "NEUTRAL" });
  });
});

import { describe, expect, it } from "vitest";
import {
  calculateCustomSplit,
  calculateEvenSplit,
  calculatePercentageSplit,
  calculateSharesSplit,
  calculateSplit
} from "../../src/server/splits";

describe("split calculators", () => {
  it("splits evenly with deterministic remainder", () => {
    const split = calculateEvenSplit(100, ["m2", "m1", "m3"]);
    expect(split).toEqual([
      { memberId: "m1", amountCents: 34 },
      { memberId: "m2", amountCents: 33 },
      { memberId: "m3", amountCents: 33 }
    ]);
  });

  it("validates custom split totals", () => {
    const split = calculateCustomSplit(150, [
      { memberId: "m1", amountCents: 50 },
      { memberId: "m2", amountCents: 100 }
    ]);
    expect(split.map((item) => item.amountCents)).toEqual([50, 100]);
  });

  it("splits percentages with bps", () => {
    const split = calculatePercentageSplit(101, [
      { memberId: "a", percentageBps: 5000 },
      { memberId: "b", percentageBps: 5000 }
    ]);
    expect(split.reduce((sum, row) => sum + row.amountCents, 0)).toBe(101);
    expect(split[0].amountCents).toBeGreaterThanOrEqual(split[1].amountCents);
  });

  it("splits using shares", () => {
    const split = calculateSharesSplit(100, [
      { memberId: "x", shareUnits: 1 },
      { memberId: "y", shareUnits: 3 }
    ]);

    expect(split).toEqual([
      { memberId: "x", amountCents: 25, shareUnits: 1 },
      { memberId: "y", amountCents: 75, shareUnits: 3 }
    ]);
  });

  it("delegates split type and validates participants", () => {
    const split = calculateSplit("EVEN", 200, ["u1", "u2"]);
    expect(split).toHaveLength(2);
  });
});

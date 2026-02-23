import { describe, expect, it } from "vitest";
import { createSettlement } from "../../src/server/settlement-service";

describe("settlement service", () => {
  it("rejects self-settlement", async () => {
    await expect(
      createSettlement({
        prisma: {} as never,
        groupId: "g1",
        createdByUserId: "u1",
        fromMemberId: "m1",
        toMemberId: "m1",
        amountCents: 100
      })
    ).rejects.toThrow("Settlement participants must be different");
  });
});

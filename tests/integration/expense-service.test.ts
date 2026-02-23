import { describe, expect, it, vi } from "vitest";
import { createExpense } from "../../src/server/expense-service";

describe("expense service", () => {
  it("rejects when payer is not in participants", async () => {
    const prisma = {
      group: {
        findUnique: vi.fn().mockResolvedValue({ id: "g1", isArchived: false, currencyCode: "USD" })
      },
      groupMember: {
        findMany: vi.fn().mockResolvedValue([
          { id: "m1", userId: "u1" },
          { id: "m2", userId: "u2" }
        ])
      }
    } as never;

    await expect(
      createExpense({
        prisma,
        groupId: "g1",
        createdByUserId: "u1",
        title: "Dinner",
        amountCents: 1000,
        paidByMemberId: "m1",
        participantMemberIds: ["m2"],
        splitType: "EVEN"
      })
    ).rejects.toThrow("Payer must be included in participants");
  });
});

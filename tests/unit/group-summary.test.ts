import { describe, expect, it } from "vitest";
import { summarizeCounterparty } from "../../src/server/group-summary";

describe("summarizeCounterparty", () => {
  it("returns settled when my net is zero", () => {
    const result = summarizeCounterparty({
      myMemberId: "m1",
      balances: [
        { memberId: "m1", netCents: 0, member: { memberId: "m1", name: "Me", email: "me@test" } },
        { memberId: "m2", netCents: 0, member: { memberId: "m2", name: "Alex", email: "alex@test" } }
      ],
      suggestions: []
    });

    expect(result).toEqual({
      direction: "SETTLED",
      amountCents: 0,
      name: "All settled"
    });
  });

  it("picks top counterparty when I am owed", () => {
    const result = summarizeCounterparty({
      myMemberId: "m1",
      balances: [
        { memberId: "m1", netCents: 1000, member: { memberId: "m1", name: "Me", email: "me@test" } },
        { memberId: "m2", netCents: -600, member: { memberId: "m2", name: "Alex", email: "alex@test" } },
        { memberId: "m3", netCents: -400, member: { memberId: "m3", name: "Sam", email: "sam@test" } }
      ],
      suggestions: [
        {
          fromMemberId: "m2",
          toMemberId: "m1",
          amountCents: 600,
          fromMember: { memberId: "m2", name: "Alex", email: "alex@test" }
        },
        {
          fromMemberId: "m3",
          toMemberId: "m1",
          amountCents: 400,
          fromMember: { memberId: "m3", name: "Sam", email: "sam@test" }
        }
      ]
    });

    expect(result).toEqual({
      direction: "OWED",
      amountCents: 600,
      name: "Alex"
    });
  });

  it("picks top counterparty when I owe", () => {
    const result = summarizeCounterparty({
      myMemberId: "m1",
      balances: [
        { memberId: "m1", netCents: -900, member: { memberId: "m1", name: "Me", email: "me@test" } },
        { memberId: "m2", netCents: 900, member: { memberId: "m2", name: "Taylor", email: "taylor@test" } }
      ],
      suggestions: [
        {
          fromMemberId: "m1",
          toMemberId: "m2",
          amountCents: 900,
          toMember: { memberId: "m2", name: "Taylor", email: "taylor@test" }
        }
      ]
    });

    expect(result).toEqual({
      direction: "OWE",
      amountCents: 900,
      name: "Taylor"
    });
  });
});

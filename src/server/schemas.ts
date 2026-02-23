import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  currencyCode: z.string().trim().toUpperCase().length(3)
});

export const createInviteSchema = z.object({
  email: z.string().trim().email().optional()
});

export const joinGroupSchema = z.object({
  token: z.string().trim().min(8).max(200)
});

export const splitTypeSchema = z.enum(["EVEN", "CUSTOM", "PERCENTAGE", "SHARES"]);

export const splitParticipantSchema = z.object({
  memberId: z.string().min(1),
  amountCents: z.number().int().positive().optional(),
  percentageBps: z.number().int().positive().max(10000).optional(),
  shareUnits: z.number().int().positive().optional()
});

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(500).optional(),
  amountCents: z.number().int().positive(),
  paidByMemberId: z.string().min(1),
  participantMemberIds: z.array(z.string().min(1)).min(1),
  splitType: splitTypeSchema,
  splitParticipants: z.array(splitParticipantSchema).optional(),
  spentAt: z.string().datetime().optional()
});

export const createSettlementSchema = z.object({
  fromMemberId: z.string().min(1),
  toMemberId: z.string().min(1),
  amountCents: z.number().int().positive(),
  note: z.string().trim().max(300).optional(),
  paidAt: z.string().datetime().optional()
});

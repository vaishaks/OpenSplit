import { HttpError } from "@/server/errors";

export type SplitParticipantInput = {
  memberId: string;
  amountCents?: number;
  percentageBps?: number;
  shareUnits?: number;
};

export type SplitResult = {
  memberId: string;
  amountCents: number;
  percentageBps?: number;
  shareUnits?: number;
};

function ensureUniqueMembers(memberIds: string[]) {
  const set = new Set(memberIds);
  if (set.size !== memberIds.length) {
    throw new HttpError(400, "Participants must be unique");
  }
}

function deterministicMemberIds(memberIds: string[]) {
  return [...memberIds].sort((a, b) => a.localeCompare(b));
}

export function calculateEvenSplit(amountCents: number, memberIds: string[]): SplitResult[] {
  if (amountCents <= 0) {
    throw new HttpError(400, "Amount must be positive");
  }

  ensureUniqueMembers(memberIds);

  if (memberIds.length === 0) {
    throw new HttpError(400, "At least one participant is required");
  }

  const ordered = deterministicMemberIds(memberIds);
  const base = Math.floor(amountCents / ordered.length);
  const remainder = amountCents % ordered.length;

  return ordered.map((memberId, index) => ({
    memberId,
    amountCents: base + (index < remainder ? 1 : 0)
  }));
}

export function calculateCustomSplit(
  amountCents: number,
  inputs: SplitParticipantInput[]
): SplitResult[] {
  if (amountCents <= 0) {
    throw new HttpError(400, "Amount must be positive");
  }

  const ordered = [...inputs].sort((a, b) => a.memberId.localeCompare(b.memberId));
  ensureUniqueMembers(ordered.map((item) => item.memberId));

  const total = ordered.reduce((sum, item) => sum + (item.amountCents ?? 0), 0);
  if (total !== amountCents) {
    throw new HttpError(400, "Custom split must match total amount");
  }

  for (const item of ordered) {
    if (!item.amountCents || item.amountCents <= 0) {
      throw new HttpError(400, "Custom split requires positive amount for each participant");
    }
  }

  return ordered.map((item) => ({
    memberId: item.memberId,
    amountCents: item.amountCents!,
    percentageBps: undefined,
    shareUnits: undefined
  }));
}

function allocateByWeightedRemainder(
  amountCents: number,
  items: { memberId: string; weight: number }[]
): Array<{ memberId: string; amountCents: number }> {
  const ordered = [...items].sort((a, b) => a.memberId.localeCompare(b.memberId));
  ensureUniqueMembers(ordered.map((item) => item.memberId));

  const totalWeight = ordered.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    throw new HttpError(400, "Total weight must be positive");
  }

  const denominator = BigInt(totalWeight);
  const computations = ordered.map((item) => {
    const numerator = BigInt(amountCents) * BigInt(item.weight);
    const base = Number(numerator / denominator);
    const remainder = Number(numerator % denominator);

    return {
      memberId: item.memberId,
      base,
      remainder
    };
  });

  const baseTotal = computations.reduce((sum, item) => sum + item.base, 0);
  let penniesLeft = amountCents - baseTotal;

  const byRemainder = [...computations].sort((a, b) => {
    if (b.remainder === a.remainder) {
      return a.memberId.localeCompare(b.memberId);
    }
    return b.remainder - a.remainder;
  });

  const bonusMap = new Map<string, number>();
  for (const item of byRemainder) {
    if (penniesLeft <= 0) {
      break;
    }
    bonusMap.set(item.memberId, 1);
    penniesLeft -= 1;
  }

  return computations.map((item) => ({
    memberId: item.memberId,
    amountCents: item.base + (bonusMap.get(item.memberId) ?? 0)
  }));
}

export function calculatePercentageSplit(
  amountCents: number,
  inputs: SplitParticipantInput[]
): SplitResult[] {
  const totalBps = inputs.reduce((sum, item) => sum + (item.percentageBps ?? 0), 0);
  if (totalBps !== 10000) {
    throw new HttpError(400, "Percentages must sum to 10000 bps (100%)");
  }

  for (const item of inputs) {
    if (!item.percentageBps || item.percentageBps <= 0) {
      throw new HttpError(400, "Percentage split requires positive bps for each participant");
    }
  }

  const allocated = allocateByWeightedRemainder(
    amountCents,
    inputs.map((item) => ({
      memberId: item.memberId,
      weight: item.percentageBps!
    }))
  );

  const bpsByMember = new Map(inputs.map((item) => [item.memberId, item.percentageBps!]));

  return allocated.map((item) => ({
    memberId: item.memberId,
    amountCents: item.amountCents,
    percentageBps: bpsByMember.get(item.memberId)
  }));
}

export function calculateSharesSplit(
  amountCents: number,
  inputs: SplitParticipantInput[]
): SplitResult[] {
  for (const item of inputs) {
    if (!item.shareUnits || item.shareUnits <= 0) {
      throw new HttpError(400, "Shares split requires positive units for each participant");
    }
  }

  const allocated = allocateByWeightedRemainder(
    amountCents,
    inputs.map((item) => ({
      memberId: item.memberId,
      weight: item.shareUnits!
    }))
  );

  const sharesByMember = new Map(inputs.map((item) => [item.memberId, item.shareUnits!]));

  return allocated.map((item) => ({
    memberId: item.memberId,
    amountCents: item.amountCents,
    shareUnits: sharesByMember.get(item.memberId)
  }));
}

export function calculateSplit(
  splitType: "EVEN" | "CUSTOM" | "PERCENTAGE" | "SHARES",
  amountCents: number,
  participantMemberIds: string[],
  splitParticipants?: SplitParticipantInput[]
): SplitResult[] {
  if (splitType === "EVEN") {
    return calculateEvenSplit(amountCents, participantMemberIds);
  }

  if (!splitParticipants || splitParticipants.length === 0) {
    throw new HttpError(400, "Split configuration is required for this split type");
  }

  const splitMemberIds = deterministicMemberIds(splitParticipants.map((item) => item.memberId));
  const participantIdsSorted = deterministicMemberIds(participantMemberIds);

  if (splitMemberIds.join("|") !== participantIdsSorted.join("|")) {
    throw new HttpError(400, "Split participants must match participantMemberIds exactly");
  }

  if (splitType === "CUSTOM") {
    return calculateCustomSplit(amountCents, splitParticipants);
  }

  if (splitType === "PERCENTAGE") {
    return calculatePercentageSplit(amountCents, splitParticipants);
  }

  return calculateSharesSplit(amountCents, splitParticipants);
}

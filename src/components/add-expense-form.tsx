"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import { parseMoneyToCents } from "@/lib/money";
import type { GroupDetail } from "@/lib/types";

type SplitType = "EVEN" | "CUSTOM" | "PERCENTAGE" | "SHARES";

export function AddExpenseForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState<SplitType>("EVEN");
  const [payer, setPayer] = useState<string>("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const groupQuery = useQuery<{ group: GroupDetail }>({
    queryKey: ["group", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}`)
  });

  const members = groupQuery.data?.group.members ?? [];

  const submitMutation = useMutation({
    mutationFn: async () => {
      const amountCents = parseMoneyToCents(amount);
      const splitParticipants =
        splitType === "EVEN"
          ? undefined
          : participants.map((memberId) => {
              const raw = customValues[memberId] || "0";
              if (splitType === "CUSTOM") {
                return { memberId, amountCents: parseMoneyToCents(raw) };
              }
              if (splitType === "PERCENTAGE") {
                return { memberId, percentageBps: Math.round(Number(raw) * 100) };
              }
              return { memberId, shareUnits: Math.round(Number(raw)) };
            });

      return fetchJson(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        body: JSON.stringify({
          title,
          notes: notes || undefined,
          amountCents,
          paidByMemberId: payer,
          participantMemberIds: participants,
          splitType,
          splitParticipants
        })
      });
    },
    onSuccess: () => {
      router.push(`/groups/${groupId}`);
      router.refresh();
    }
  });

  const amountLabel = useMemo(() => {
    if (splitType === "CUSTOM") {
      return "Custom amount";
    }
    if (splitType === "PERCENTAGE") {
      return "Percentage";
    }
    if (splitType === "SHARES") {
      return "Shares";
    }
    return "Value";
  }, [splitType]);

  if (groupQuery.isLoading) {
    return <p className="text-sm text-muted">Loading members...</p>;
  }

  return (
    <form
      className="space-y-4 rounded-2xl bg-white p-5 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        submitMutation.mutate();
      }}
    >
      <h1 className="text-2xl font-black text-ink">Add Expense</h1>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Title</span>
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
          placeholder="Groceries"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Amount</span>
        <input
          required
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
          placeholder="48.50"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Payer</span>
        <select
          required
          value={payer}
          onChange={(event) => {
            const nextPayer = event.target.value;
            setPayer(nextPayer);
            setParticipants((prev) =>
              prev.includes(nextPayer) ? prev : [...prev, nextPayer]
            );
          }}
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        >
          <option value="">Select payer</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.user.name || member.user.email}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-ink">Participants</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {members.map((member) => {
            const checked = participants.includes(member.id);
            return (
              <label key={member.id} className="flex items-center gap-2 rounded-xl border border-ink/15 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    setParticipants((prev) =>
                      event.target.checked
                        ? Array.from(new Set([...prev, member.id]))
                        : prev.filter((value) => value !== member.id)
                    );
                  }}
                />
                <span>{member.user.name || member.user.email}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Split Type</span>
        <select
          value={splitType}
          onChange={(event) => setSplitType(event.target.value as SplitType)}
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        >
          <option value="EVEN">Even</option>
          <option value="CUSTOM">Custom</option>
          <option value="PERCENTAGE">Percentage</option>
          <option value="SHARES">Shares</option>
        </select>
      </label>

      {splitType !== "EVEN" && participants.length > 0 ? (
        <div className="space-y-2 rounded-xl bg-surface p-3">
          <p className="text-sm font-semibold text-ink">{amountLabel} per participant</p>
          {participants.map((memberId) => {
            const member = members.find((item) => item.id === memberId);
            return (
              <label key={memberId} className="flex items-center justify-between gap-2 text-sm">
                <span>{member?.user.name || member?.user.email || memberId}</span>
                <input
                  value={customValues[memberId] ?? ""}
                  onChange={(event) =>
                    setCustomValues((prev) => ({
                      ...prev,
                      [memberId]: event.target.value
                    }))
                  }
                  className="w-28 rounded-lg border border-ink/20 px-2 py-1 text-right"
                  placeholder={splitType === "PERCENTAGE" ? "50" : splitType === "SHARES" ? "1" : "0"}
                />
              </label>
            );
          })}
        </div>
      ) : null}

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="h-24 w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
          placeholder="Anything important about this expense"
        />
      </label>

      {submitMutation.error ? (
        <p className="text-sm text-danger">{(submitMutation.error as Error).message}</p>
      ) : null}

      <button
        disabled={submitMutation.isPending}
        className="w-full rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitMutation.isPending ? "Saving..." : "Save Expense"}
      </button>
    </form>
  );
}

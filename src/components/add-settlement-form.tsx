"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import { parseMoneyToCents } from "@/lib/money";
import type { GroupDetail } from "@/lib/types";

export function AddSettlementForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [fromMemberId, setFromMemberId] = useState("");
  const [toMemberId, setToMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const groupQuery = useQuery<{ group: GroupDetail }>({
    queryKey: ["group", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}`)
  });

  const members = groupQuery.data?.group.members ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      fetchJson(`/api/groups/${groupId}/settlements`, {
        method: "POST",
        body: JSON.stringify({
          fromMemberId,
          toMemberId,
          amountCents: parseMoneyToCents(amount),
          note: note || undefined
        })
      }),
    onSuccess: () => {
      router.push(`/groups/${groupId}`);
      router.refresh();
    }
  });

  if (groupQuery.isLoading) {
    return <p className="text-sm text-muted">Loading members...</p>;
  }

  return (
    <form
      className="space-y-4 rounded-2xl bg-white p-5 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <h1 className="text-2xl font-black text-ink">Record Settlement</h1>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Who paid?</span>
        <select
          required
          value={fromMemberId}
          onChange={(event) => setFromMemberId(event.target.value)}
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        >
          <option value="">Select member</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.user.name || member.user.email}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Who received?</span>
        <select
          required
          value={toMemberId}
          onChange={(event) => setToMemberId(event.target.value)}
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        >
          <option value="">Select member</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.user.name || member.user.email}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Amount</span>
        <input
          required
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="20.00"
          className="w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-ink">Note (optional)</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="h-24 w-full rounded-xl border border-ink/20 px-3 py-2 text-sm"
          placeholder="Cash transfer"
        />
      </label>

      {mutation.error ? <p className="text-sm text-danger">{(mutation.error as Error).message}</p> : null}

      <button
        disabled={mutation.isPending}
        className="w-full rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {mutation.isPending ? "Saving..." : "Record Settlement"}
      </button>
    </form>
  );
}

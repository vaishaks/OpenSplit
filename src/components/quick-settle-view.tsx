"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { fetchJson } from "@/lib/fetcher";
import { formatMoney } from "@/lib/money";
import type { BalanceItem, GroupDetail, SuggestedSettlement } from "@/lib/types";
import { buildQuickSettleRows, type QuickSettleRow } from "@/lib/quick-settle";

export function QuickSettleView({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [recentlySettledMemberId, setRecentlySettledMemberId] = useState<string | null>(null);

  const groupQuery = useQuery<{ group: GroupDetail }>({
    queryKey: ["group", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}`)
  });

  const balancesQuery = useQuery<{ balances: BalanceItem[]; suggestions: SuggestedSettlement[] }>({
    queryKey: ["balances", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}/balances`)
  });

  const myMember = useMemo(() => {
    const userId = session?.user?.id;
    if (!userId) {
      return null;
    }
    return groupQuery.data?.group.members.find((member) => member.userId === userId) ?? null;
  }, [groupQuery.data?.group.members, session?.user?.id]);

  const rows = useMemo(() => {
    if (!myMember) {
      return [];
    }

    return buildQuickSettleRows({
      myMemberId: myMember.id,
      balances: balancesQuery.data?.balances ?? [],
      suggestions: balancesQuery.data?.suggestions ?? []
    });
  }, [balancesQuery.data?.balances, balancesQuery.data?.suggestions, myMember]);

  const settleMutation = useMutation({
    mutationFn: (row: QuickSettleRow) => {
      if (!row.isActionable || !row.fromMemberId || !row.toMemberId) {
        throw new Error("This member is already settled.");
      }

      return fetchJson(`/api/groups/${groupId}/settlements`, {
        method: "POST",
        body: JSON.stringify({
          fromMemberId: row.fromMemberId,
          toMemberId: row.toMemberId,
          amountCents: row.amountCents,
          note: `Quick settle with ${row.name}`
        })
      });
    },
    onSuccess: (_data, row) => {
      setRecentlySettledMemberId(row.memberId);
      queryClient.invalidateQueries({ queryKey: ["balances", groupId] });
      queryClient.invalidateQueries({ queryKey: ["settlements", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    }
  });

  if (groupQuery.isLoading || balancesQuery.isLoading) {
    return <p className="p-4 text-sm text-ui-muted">Loading balances...</p>;
  }

  const firstError = groupQuery.error || balancesQuery.error;
  if (firstError) {
    return <p className="p-4 text-sm text-danger">{(firstError as Error).message}</p>;
  }

  const group = groupQuery.data?.group;
  if (!group) {
    return <p className="p-4 text-sm text-danger">Group not found.</p>;
  }

  if (!myMember) {
    return (
      <section className="space-y-4 rounded-2xl bg-white p-4">
        <h1 className="text-2xl font-semibold text-ui-ink">Settle up</h1>
        <p className="text-sm text-danger">Unable to identify your member record in this group.</p>
        <Link
          href={`/groups/${groupId}/settle/new?mode=manual` as Route}
          className="inline-flex rounded-full border border-ui-border px-4 py-2 text-sm font-semibold text-ui-ink"
        >
          Use manual entry
        </Link>
      </section>
    );
  }

  const actionableCount = rows.filter((row) => row.isActionable).length;

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4 rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ui-ink">Settle up</h1>
        <Link href={`/groups/${groupId}` as Route} className="text-sm font-semibold text-ui-success">
          Done
        </Link>
      </div>

      <p className="text-sm text-ui-muted">
        Select a member to auto-record the full outstanding balance.
      </p>

      <div className="space-y-2">
        {rows.map((row) => {
          const isPending = settleMutation.isPending && settleMutation.variables?.memberId === row.memberId;
          const isFreshlySettled = recentlySettledMemberId === row.memberId && !row.isActionable;

          return (
            <button
              key={row.memberId}
              type="button"
              disabled={!row.isActionable || isPending}
              onClick={() => settleMutation.mutate(row)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                row.isActionable
                  ? "border-ui-border bg-white hover:border-ui-success"
                  : "border-ui-border/70 bg-ui-bg"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-semibold text-ui-ink">{row.name}</p>
                <p
                  className={`text-base font-semibold ${
                    row.direction === "OWES_YOU"
                      ? "text-ui-success"
                      : row.direction === "YOU_OWE"
                        ? "text-ui-warn"
                        : "text-ui-muted"
                  }`}
                >
                  {row.direction === "SETTLED"
                    ? "settled"
                    : formatMoney(row.amountCents, group.currencyCode)}
                </p>
              </div>
              <p className="mt-1 text-sm text-ui-muted">
                {isPending
                  ? "Recording settlement..."
                  : row.direction === "OWES_YOU"
                    ? "owes you"
                    : row.direction === "YOU_OWE"
                      ? "you owe"
                      : isFreshlySettled
                        ? "settled just now"
                        : "settled"}
              </p>
            </button>
          );
        })}
      </div>

      {actionableCount === 0 ? (
        <p className="rounded-lg bg-ui-bg px-3 py-2 text-sm text-ui-muted">
          No direct settle suggestions available. You can still record a manual settlement.
        </p>
      ) : null}

      {settleMutation.error ? (
        <p className="text-sm text-danger">{(settleMutation.error as Error).message}</p>
      ) : null}

      <Link
        href={`/groups/${groupId}/settle/new?mode=manual` as Route}
        className="inline-flex rounded-full border border-ui-border px-4 py-2 text-sm font-semibold text-ui-ink"
      >
        Manual entry
      </Link>
    </section>
  );
}

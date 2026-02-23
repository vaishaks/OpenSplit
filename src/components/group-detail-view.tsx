"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type {
  BalanceItem,
  ExpenseFeedItem,
  GroupDetail,
  SettlementFeedItem,
  SuggestedSettlement
} from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { EmptyState } from "@/components/empty-state";

type TabKey = "expenses" | "balances" | "settlements";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "expenses", label: "Expenses" },
  { key: "balances", label: "Balances" },
  { key: "settlements", label: "Settle Up" }
];

function nameOf(member: { name: string | null; email: string }) {
  return member.name || member.email;
}

export function GroupDetailView({ groupId }: { groupId: string }) {
  const [tab, setTab] = useState<TabKey>("expenses");

  const groupQuery = useQuery<{ group: GroupDetail }>({
    queryKey: ["group", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}`)
  });

  const expensesQuery = useQuery<{ items: ExpenseFeedItem[] }>({
    queryKey: ["expenses", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}/expenses?limit=25`)
  });

  const balancesQuery = useQuery<{
    balances: BalanceItem[];
    suggestions: SuggestedSettlement[];
  }>({
    queryKey: ["balances", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}/balances`)
  });

  const settlementsQuery = useQuery<{ settlements: SettlementFeedItem[] }>({
    queryKey: ["settlements", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}/settlements`)
  });

  const loading =
    groupQuery.isLoading || expensesQuery.isLoading || balancesQuery.isLoading || settlementsQuery.isLoading;
  const firstError =
    groupQuery.error || expensesQuery.error || balancesQuery.error || settlementsQuery.error;

  const group = groupQuery.data?.group;
  const expenses = expensesQuery.data?.items ?? [];
  const balances = balancesQuery.data?.balances ?? [];
  const suggestions = balancesQuery.data?.suggestions ?? [];
  const settlements = settlementsQuery.data?.settlements ?? [];

  const membersById = useMemo(() => {
    const map = new Map<string, GroupDetail["members"][number]>();
    for (const member of group?.members ?? []) {
      map.set(member.id, member);
    }
    return map;
  }, [group]);

  if (loading) {
    return <p className="text-sm text-muted">Loading group data...</p>;
  }

  if (firstError) {
    return <p className="text-sm text-danger">{(firstError as Error).message}</p>;
  }

  if (!group) {
    return <p className="text-sm text-danger">Group not found.</p>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-white p-5 shadow-card">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{group.currencyCode} group</p>
        <h1 className="mt-1 text-3xl font-black text-ink">{group.name}</h1>
        <p className="mt-2 text-sm text-muted">{group.members.length} active members</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/groups/${group.id}/expenses/new`} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
            Add Expense
          </Link>
          <Link href={`/groups/${group.id}/settle/new`} className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink">
            Record Settlement
          </Link>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-card">
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface p-1">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                tabItem.key === tab ? "bg-white text-ink shadow" : "text-muted"
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {tab === "expenses" ? (
          <div className="mt-4 space-y-3">
            {expenses.length === 0 ? (
              <EmptyState
                title="No expenses yet"
                description="Add the first expense to start tracking balances."
              />
            ) : (
              expenses.map((expense) => (
                <article key={expense.id} className="rounded-2xl border border-ink/10 px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-ink">{expense.title}</h3>
                      <p className="text-xs text-muted">
                        Paid by {nameOf(expense.paidByMember.user)} on {new Date(expense.spentAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-base font-black text-ink">
                      {formatMoney(expense.amountCents, group.currencyCode)}
                    </p>
                  </div>
                  {expense.notes ? <p className="mt-2 text-sm text-muted">{expense.notes}</p> : null}
                </article>
              ))
            )}
          </div>
        ) : null}

        {tab === "balances" ? (
          <div className="mt-4 space-y-3">
            {balances.map((balance) => {
              const member = membersById.get(balance.memberId);
              const text =
                balance.netCents < 0
                  ? `owes ${formatMoney(Math.abs(balance.netCents), group.currencyCode)}`
                  : balance.netCents > 0
                    ? `gets ${formatMoney(balance.netCents, group.currencyCode)}`
                    : "is settled";

              return (
                <div key={balance.memberId} className="flex items-center justify-between rounded-xl border border-ink/10 px-3 py-2">
                  <span className="text-sm font-semibold text-ink">
                    {member ? nameOf(member.user) : balance.memberId}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      balance.netCents < 0
                        ? "text-danger"
                        : balance.netCents > 0
                          ? "text-success"
                          : "text-muted"
                    }`}
                  >
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}

        {tab === "settlements" ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-muted">Suggested Transfers</h3>
              {suggestions.length === 0 ? (
                <p className="text-sm text-muted">No transfers needed right now.</p>
              ) : (
                suggestions.map((suggestion) => {
                  const from = membersById.get(suggestion.fromMemberId);
                  const to = membersById.get(suggestion.toMemberId);
                  return (
                    <p key={`${suggestion.fromMemberId}-${suggestion.toMemberId}`} className="rounded-xl bg-accentSoft px-3 py-2 text-sm text-ink">
                      {from ? nameOf(from.user) : "Member"} should pay {to ? nameOf(to.user) : "Member"}{" "}
                      <strong>{formatMoney(suggestion.amountCents, group.currencyCode)}</strong>
                    </p>
                  );
                })
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-muted">Settlement History</h3>
              {settlements.length === 0 ? (
                <p className="text-sm text-muted">No settlements recorded yet.</p>
              ) : (
                settlements.map((item) => (
                  <div key={item.id} className="rounded-xl border border-ink/10 px-3 py-2 text-sm">
                    <p className="font-semibold text-ink">
                      {nameOf(item.fromMember.user)} paid {nameOf(item.toMember.user)} {formatMoney(item.amountCents, group.currencyCode)}
                    </p>
                    <p className="text-xs text-muted">{new Date(item.paidAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

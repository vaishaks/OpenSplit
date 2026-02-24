"use client";

import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import type { BalanceItem, GroupDetail, SuggestedSettlement } from "@/lib/types";
import { BalanceList } from "@/components/balance-list";

export function GroupBalancesView({ groupId }: { groupId: string }) {
  const groupQuery = useQuery<{ group: GroupDetail }>({
    queryKey: ["group", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}`)
  });

  const balancesQuery = useQuery<{ balances: BalanceItem[]; suggestions: SuggestedSettlement[] }>({
    queryKey: ["balances", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}/balances`)
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

  const balances = balancesQuery.data?.balances ?? [];
  const suggestions = balancesQuery.data?.suggestions ?? [];

  return (
    <section className="min-h-screen bg-ui-bg pb-8">
      <header className="sticky top-0 z-20 border-b border-ui-border bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/groups/${group.id}` as Route} className="text-3xl text-ui-ink" aria-label="Close balances">
            ×
          </Link>
          <h1 className="text-2xl font-semibold text-ui-ink">Group balances</h1>
          <span className="w-5" aria-hidden="true" />
        </div>
      </header>

      <div className="px-4 pt-4">
        <BalanceList balances={balances} suggestions={suggestions} currencyCode={group.currencyCode} groupId={group.id} />
      </div>
    </section>
  );
}

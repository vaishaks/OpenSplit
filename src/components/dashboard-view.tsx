"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import { formatMoney } from "@/lib/money";
import type { GroupSummary } from "@/lib/types";
import { EmptyState } from "@/components/empty-state";

export function DashboardView() {
  const groupsQuery = useQuery<{ groups: GroupSummary[] }>({
    queryKey: ["groups"],
    queryFn: () => fetchJson("/api/groups")
  });

  if (groupsQuery.isLoading) {
    return <p className="text-sm text-muted">Loading groups...</p>;
  }

  if (groupsQuery.error) {
    return (
      <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">
        {(groupsQuery.error as Error).message}
      </p>
    );
  }

  const groups = groupsQuery.data?.groups ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-ink">Dashboard</h1>
        <Link href="/groups/new" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
          Create Group
        </Link>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No groups yet"
          description="Create your first group to start adding shared expenses."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((group) => {
            const badge =
              group.myNetCents < 0
                ? `You owe ${formatMoney(Math.abs(group.myNetCents), group.currencyCode)}`
                : group.myNetCents > 0
                  ? `You are owed ${formatMoney(group.myNetCents, group.currencyCode)}`
                  : "You are settled";

            return (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card transition hover:-translate-y-0.5"
              >
                <p className="text-sm text-muted">{group.role}</p>
                <h2 className="mt-1 text-xl font-bold text-ink">{group.name}</h2>
                <p className="mt-3 text-sm font-semibold text-accent">{badge}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

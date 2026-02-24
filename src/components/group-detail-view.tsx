"use client";

import Link from "next/link";
import type { Route } from "next";
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
import { GroupHero } from "@/components/group-hero";
import { ActivityTimeline } from "@/components/activity-timeline";
import { FloatingActionBar } from "@/components/floating-action-bar";

function formatDateRange(range: GroupDetail["activityRange"], fallbackIso: string) {
  const start = range.start ? new Date(range.start) : new Date(fallbackIso);
  const end = range.end ? new Date(range.end) : new Date(fallbackIso);

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${new Intl.DateTimeFormat("en-US", { month: "short" }).format(start)} ${start.getDate()}-${end.getDate()}`;
  }

  return `${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(start)} - ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(end)}`;
}

function summaryLine(group: GroupDetail) {
  const summary = group.counterpartySummary;
  if (summary.direction === "SETTLED") {
    return "Everyone is settled up";
  }

  if (summary.direction === "OWED") {
    return `${summary.name} owes you ${formatMoney(summary.amountCents, group.currencyCode)}`;
  }

  return `You owe ${summary.name} ${formatMoney(summary.amountCents, group.currencyCode)}`;
}

export function GroupDetailView({ groupId }: { groupId: string }) {
  const groupQuery = useQuery<{ group: GroupDetail }>({
    queryKey: ["group", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}`)
  });

  const expensesQuery = useQuery<{ items: ExpenseFeedItem[] }>({
    queryKey: ["expenses", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}/expenses?limit=50`)
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
  const settlements = settlementsQuery.data?.settlements ?? [];

  if (loading) {
    return <p className="p-4 text-sm text-ui-muted">Loading group...</p>;
  }

  if (firstError) {
    return <p className="p-4 text-sm text-danger">{(firstError as Error).message}</p>;
  }

  if (!group) {
    return <p className="p-4 text-sm text-danger">Group not found.</p>;
  }

  const dateLabel = formatDateRange(group.activityRange, new Date().toISOString());

  return (
    <section className="bg-ui-bg pb-10">
      <GroupHero
        groupId={group.id}
        title={group.name}
        heroSeed={group.heroSeed}
        dateLabel={dateLabel}
        memberCount={group.memberCount}
      />

      <div className="bg-ui-bg px-4 pb-3 pt-4 lg:px-6">
        <p className="text-[1.5rem] font-medium text-ui-ink">{summaryLine(group)}</p>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <Link
            href={`/groups/${group.id}/settle/new` as Route}
            className="rounded-xl border border-transparent bg-[#f45d01] px-4 py-2 text-base font-semibold text-white whitespace-nowrap"
          >
            Settle up
          </Link>
          <Link
            href={`/groups/${group.id}/balances` as Route}
            className="rounded-xl border border-ui-border bg-white px-4 py-2 text-base font-semibold text-ui-ink whitespace-nowrap"
          >
            Balances
          </Link>
        </div>

        <ActivityTimeline
          currencyCode={group.currencyCode}
          expenses={expenses}
          settlements={settlements}
        />
      </div>

      <FloatingActionBar
        primaryLabel="Add expense"
        primaryHref={`/groups/${group.id}/expenses/new` as Route}
      />
    </section>
  );
}

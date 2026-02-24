"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";
import { formatMoney } from "@/lib/money";
import type { GroupSummary } from "@/lib/types";
import { GroupListRow } from "@/components/group-list-row";
import { EmptyState } from "@/components/empty-state";
import { FloatingActionBar } from "@/components/floating-action-bar";

type GroupsRailProps = {
  activeGroupId?: string;
  isDesktopRail?: boolean;
  showFloatingAction?: boolean;
};

function overallSummary(groups: GroupSummary[]) {
  if (groups.length === 0) {
    return { verb: "are settled", amount: "", className: "text-ui-muted" };
  }

  const currency = groups[0].currencyCode;
  const total = groups.reduce((sum, group) => sum + group.myNetCents, 0);

  if (total > 0) {
    return {
      verb: "are owed",
      amount: formatMoney(total, currency),
      className: "text-ui-success"
    };
  }

  if (total < 0) {
    return {
      verb: "owe",
      amount: formatMoney(Math.abs(total), currency),
      className: "text-ui-warn"
    };
  }

  return { verb: "are settled", amount: "", className: "text-ui-muted" };
}

export function GroupsRail({
  activeGroupId,
  isDesktopRail = false,
  showFloatingAction = false
}: GroupsRailProps) {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const groupsQuery = useQuery<{ groups: GroupSummary[] }>({
    queryKey: ["groups"],
    queryFn: () => fetchJson("/api/groups")
  });

  const groups = groupsQuery.data?.groups ?? [];
  const summary = overallSummary(groups);
  const needle = search.trim().toLowerCase();
  const filtered = !needle
    ? groups
    : groups.filter((group) => {
        const line = `${group.name} ${group.counterpartySummary?.name ?? ""}`.toLowerCase();
        return line.includes(needle);
      });

  const primaryExpenseHref = (groups[0] ? `/groups/${groups[0].id}/expenses/new` : "/groups/new") as Route;

  if (groupsQuery.isLoading) {
    return <p className="p-4 text-sm text-ui-muted">Loading groups...</p>;
  }

  if (groupsQuery.error) {
    return <p className="p-4 text-sm text-danger">{(groupsQuery.error as Error).message}</p>;
  }

  return (
    <>
      <section className={`bg-ui-bg ${isDesktopRail ? "h-full border-r border-ui-border px-5 py-5" : "px-4 pt-4"}`}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSearch((value) => !value)}
            className="text-2xl text-ui-ink"
            aria-label="Toggle search"
          >
            🔍
          </button>
          <Link href="/groups/new" className="text-xl font-semibold text-ui-success">
            Create group
          </Link>
          <span className="text-2xl text-ui-muted" aria-hidden="true">
            ☰
          </span>
        </div>

        {showSearch ? (
          <label className="mt-3 block">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search groups"
              className="w-full rounded-2xl border border-ui-border bg-white px-4 py-3 text-base"
            />
          </label>
        ) : null}

        <p className="mt-6 text-[1.45rem] font-semibold text-ui-ink">
          Overall, you {summary.verb}{" "}
          {summary.amount ? <span className={summary.className}>{summary.amount}</span> : null}
        </p>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState title="No groups found" description="Create a group to start tracking expenses." />
          ) : (
            filtered.map((group) => (
              <div key={group.id} className={group.id === activeGroupId ? "rounded-2xl bg-white/70 px-2" : "px-2"}>
                <GroupListRow group={group} />
              </div>
            ))
          )}
        </div>
      </section>
      {showFloatingAction ? <FloatingActionBar primaryLabel="Add expense" primaryHref={primaryExpenseHref} /> : null}
    </>
  );
}

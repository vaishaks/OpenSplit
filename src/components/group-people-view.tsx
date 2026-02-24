"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { fetchJson } from "@/lib/fetcher";
import type { GroupDetail } from "@/lib/types";
import { InviteControls } from "@/components/invite-controls";

export function GroupPeopleView({ groupId }: { groupId: string }) {
  const { data: session } = useSession();

  const groupQuery = useQuery<{ group: GroupDetail }>({
    queryKey: ["group", groupId],
    queryFn: () => fetchJson(`/api/groups/${groupId}`)
  });

  const canInvite = useMemo(() => {
    const userId = session?.user?.id;
    if (!userId) {
      return false;
    }

    const me = groupQuery.data?.group.members.find((member) => member.userId === userId);
    return me?.role === "OWNER";
  }, [groupQuery.data?.group.members, session?.user?.id]);

  if (groupQuery.isLoading) {
    return <p className="p-4 text-sm text-ui-muted">Loading people...</p>;
  }

  if (groupQuery.error) {
    return <p className="p-4 text-sm text-danger">{(groupQuery.error as Error).message}</p>;
  }

  const group = groupQuery.data?.group;
  if (!group) {
    return <p className="p-4 text-sm text-danger">Group not found.</p>;
  }

  return (
    <section className="min-h-screen bg-ui-bg pb-8">
      <header className="sticky top-0 z-20 border-b border-ui-border bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/groups/${group.id}` as Route} className="text-2xl text-ui-ink" aria-label="Back to group">
            ←
          </Link>
          <h1 className="text-xl font-semibold text-ui-ink">People</h1>
          <span className="w-5" aria-hidden="true" />
        </div>
      </header>

      <div className="space-y-4 px-4 pt-4">
        <section className="rounded-2xl border border-ui-border bg-white">
          <h2 className="border-b border-ui-border px-4 py-3 text-base font-semibold text-ui-ink">
            Current members
          </h2>
          <ul>
            {group.members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 border-b border-ui-border/70 px-4 py-3 last:border-b-0">
                <div>
                  <p className="text-base font-semibold text-ui-ink">{member.user.name || member.user.email}</p>
                  <p className="text-sm text-ui-muted">{member.user.email}</p>
                </div>
                <div className="flex gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-ui-bg px-2 py-1 text-ui-ink">{member.role}</span>
                  <span className="rounded-full bg-ui-bg px-2 py-1 text-ui-muted">{member.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <InviteControls groupId={group.id} canInvite={canInvite} compact />
      </div>
    </section>
  );
}

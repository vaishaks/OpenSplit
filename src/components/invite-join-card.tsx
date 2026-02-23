"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";

export function InviteJoinCard({ token }: { token: string }) {
  const router = useRouter();
  const [resultGroupId, setResultGroupId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      fetchJson<{ groupId: string }>("/api/groups/join", {
        method: "POST",
        body: JSON.stringify({ token })
      }),
    onSuccess: (data) => {
      setResultGroupId(data.groupId);
      router.push(`/groups/${data.groupId}`);
      router.refresh();
    }
  });

  return (
    <section className="mx-auto max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-card">
      <h1 className="text-2xl font-black text-ink">Join Group</h1>
      <p className="text-sm text-muted">Use this invite to join and start splitting expenses.</p>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white"
      >
        {mutation.isPending ? "Joining..." : "Join with Invite"}
      </button>
      {mutation.error ? <p className="text-sm text-danger">{(mutation.error as Error).message}</p> : null}
      {resultGroupId ? <p className="text-sm text-success">Joined successfully. Redirecting...</p> : null}
    </section>
  );
}

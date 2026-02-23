"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";

type InviteResponse = {
  token: string;
  inviteUrl: string;
  type: "link" | "email";
};

export function InviteControls({ groupId }: { groupId: string }) {
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const inviteMutation = useMutation({
    mutationFn: (payload: { email?: string }) =>
      fetchJson<InviteResponse>(`/api/groups/${groupId}/invites`, {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: (data) => {
      setInviteUrl(data.inviteUrl);
    }
  });

  return (
    <section className="rounded-2xl bg-white p-4 shadow-card">
      <h2 className="text-lg font-bold text-ink">Invite Members</h2>
      <p className="mt-1 text-sm text-muted">Create a reusable link or an email-bound invite token.</p>
      <div className="mt-3 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => inviteMutation.mutate({})}
          className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink"
        >
          Generate Invite Link
        </button>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!email) {
              return;
            }
            inviteMutation.mutate({ email });
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="friend@example.com"
            className="flex-1 rounded-xl border border-ink/20 px-3 py-2 text-sm"
          />
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Create Email Invite</button>
        </form>
      </div>

      {inviteMutation.error ? (
        <p className="mt-2 text-sm text-danger">{(inviteMutation.error as Error).message}</p>
      ) : null}

      {inviteUrl ? (
        <div className="mt-3 rounded-xl bg-surface p-3 text-sm">
          <p className="font-semibold text-ink">Invite URL</p>
          <p className="break-all text-muted">{inviteUrl}</p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(inviteUrl)}
            className="mt-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white"
          >
            Copy Link
          </button>
        </div>
      ) : null}
    </section>
  );
}

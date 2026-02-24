"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/fetcher";

type InviteResponse = {
  token: string;
  inviteUrl: string;
  type: "link" | "email";
};

export function InviteControls({
  groupId,
  canInvite = true,
  compact = false
}: {
  groupId: string;
  canInvite?: boolean;
  compact?: boolean;
}) {
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
    <section className={`rounded-2xl bg-white p-4 shadow-card ${compact ? "" : ""}`}>
      <h2 className="text-lg font-bold text-ink">Invite Members</h2>
      <p className="mt-1 text-sm text-muted">Create a reusable link or an email-bound invite token.</p>
      {!canInvite ? (
        <p className="mt-2 rounded-lg bg-ui-bg px-3 py-2 text-sm text-ui-muted">
          Only group owners can send invites.
        </p>
      ) : null}
      <div className="mt-3 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            if (!canInvite) {
              return;
            }
            inviteMutation.mutate({});
          }}
          disabled={!canInvite || inviteMutation.isPending}
          className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink"
        >
          Generate Invite Link
        </button>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!email || !canInvite) {
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
            disabled={!canInvite || inviteMutation.isPending}
            className="flex-1 rounded-xl border border-ink/20 px-3 py-2 text-sm"
          />
          <button
            disabled={!canInvite || inviteMutation.isPending}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Create Email Invite
          </button>
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

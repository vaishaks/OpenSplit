"use client";

import { signOut, useSession } from "next-auth/react";

export function AccountView() {
  const { data: session } = useSession();

  return (
    <section className="min-h-screen bg-ui-bg px-4 pt-6">
      <h1 className="text-3xl font-semibold text-ui-ink">Account</h1>
      <div className="mt-4 rounded-2xl border border-ui-border bg-white p-5">
        <p className="text-lg font-semibold text-ui-ink">{session?.user?.name || "OpenSplit user"}</p>
        <p className="mt-1 text-base text-ui-muted">{session?.user?.email || "No email available"}</p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-6 rounded-full border border-ui-border px-5 py-2 text-lg font-semibold text-ui-ink"
        >
          Sign out
        </button>
      </div>
    </section>
  );
}

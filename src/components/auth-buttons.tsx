"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink"
      >
        Sign out
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
      >
        Continue with Google
      </button>
      {process.env.NEXT_PUBLIC_TEST_MODE === "true" ? (
        <button
          type="button"
          onClick={() =>
            signIn("credentials", {
              email: "demo@opensplit.test",
              name: "Demo User",
              callbackUrl
            })
          }
          className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink"
        >
          Demo login
        </button>
      ) : null}
    </div>
  );
}

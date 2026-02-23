import Link from "next/link";
import { auth } from "@/server/auth";
import { AuthButtons } from "@/components/auth-buttons";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const session = await auth();
  const { invite } = await searchParams;
  const callbackUrl = invite ? `/invite/${invite}` : "/dashboard";

  return (
    <section className="grid gap-8 py-8 md:grid-cols-[1.2fr_1fr] md:items-center">
      <div>
        <p className="inline-flex rounded-full bg-accentSoft px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-accent">
          Transparent Group Splitting
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-ink sm:text-5xl">
          OpenSplit makes shared expenses obvious and fair.
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
          Track who paid, who shared, and what each person owes across roommates, trips, and events.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <AuthButtons callbackUrl={callbackUrl} />
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-full border border-ink/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink"
            >
              Open Dashboard
            </Link>
          ) : null}
        </div>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-card">
        <div className="space-y-4">
          <div className="rounded-2xl bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Live Balance</p>
            <p className="mt-2 text-2xl font-black text-ink">You owe $15.25</p>
            <p className="text-sm text-muted">Across 2 groups</p>
          </div>
          <div className="rounded-2xl bg-accentSoft p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Settle Suggestion</p>
            <p className="mt-2 text-lg font-bold text-ink">Pay Alex $10.00</p>
            <p className="text-sm text-muted">Then your trip group is fully settled.</p>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm">
              <span>Groceries</span>
              <span className="font-bold">$48.50</span>
            </li>
            <li className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm">
              <span>Gas</span>
              <span className="font-bold">$32.20</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

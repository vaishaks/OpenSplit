import Link from "next/link";
import type { Route } from "next";
import { formatMoney } from "@/lib/money";
import type { BalanceItem, SuggestedSettlement } from "@/lib/types";

type BalanceListProps = {
  balances: BalanceItem[];
  suggestions: SuggestedSettlement[];
  currencyCode: string;
  groupId: string;
};

export function BalanceList({ balances, suggestions, currencyCode, groupId }: BalanceListProps) {
  const suggestionByCreditor = new Map<string, SuggestedSettlement>();
  for (const suggestion of suggestions) {
    if (!suggestionByCreditor.has(suggestion.toMemberId)) {
      suggestionByCreditor.set(suggestion.toMemberId, suggestion);
    }
  }

  return (
    <section className="space-y-3 pb-20">
      {balances.map((balance) => {
        const name = balance.member?.name || balance.member?.email || "Member";
        const suggestion = suggestionByCreditor.get(balance.memberId);

        return (
          <article key={balance.memberId} className="rounded-2xl border border-ui-border bg-white px-4 py-4">
            <p className="text-[2rem] leading-tight text-ui-ink">
              <strong>{name}</strong>{" "}
              {balance.netCents > 0 ? "gets back" : balance.netCents < 0 ? "owes" : "is settled up"}{" "}
              {balance.netCents === 0 ? null : (
                <span className={balance.netCents > 0 ? "text-ui-success" : "text-ui-warn"}>
                  {formatMoney(Math.abs(balance.netCents), currencyCode)}
                </span>
              )}
              {balance.netCents !== 0 ? " in total" : null}
            </p>

            {suggestion ? (
              <div className="mt-3 rounded-xl bg-ui-surface px-3 py-3">
                <p className="text-[1.8rem] text-ui-muted">
                  {(suggestion.fromMember?.name || suggestion.fromMember?.email || "Member")} owes{" "}
                  {formatMoney(suggestion.amountCents, currencyCode)}
                </p>
                <div className="mt-3 flex gap-3">
                  <button type="button" className="rounded-xl border border-ui-border bg-white px-5 py-2 text-[1.7rem] font-semibold text-ui-ink">
                    Remind...
                  </button>
                  <Link
                    href={`/groups/${groupId}/settle/new?fromMemberId=${suggestion.fromMemberId}&toMemberId=${suggestion.toMemberId}&amountCents=${suggestion.amountCents}` as Route}
                    className="rounded-xl border border-ui-border bg-white px-5 py-2 text-[1.7rem] font-semibold text-ui-ink"
                  >
                    Settle up
                  </Link>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}

      <aside className="mt-6 rounded-xl bg-ui-surface px-4 py-4 text-[1.75rem] text-ui-muted">
        Simplify debts is on, saving your group repayment steps.
      </aside>
    </section>
  );
}

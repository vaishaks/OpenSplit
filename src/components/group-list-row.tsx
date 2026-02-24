import Link from "next/link";
import type { Route } from "next";
import { formatMoney } from "@/lib/money";
import type { GroupSummary } from "@/lib/types";
import { seedToGradient } from "@/lib/visual-seed";

function summaryText(group: GroupSummary) {
  if (!group.counterpartySummary || group.counterpartySummary.direction === "SETTLED") {
    return "All settled up";
  }

  if (group.counterpartySummary.direction === "OWED") {
    return `${group.counterpartySummary.name} owes you ${formatMoney(group.counterpartySummary.amountCents, group.currencyCode)}`;
  }

  return `You owe ${group.counterpartySummary.name} ${formatMoney(group.counterpartySummary.amountCents, group.currencyCode)}`;
}

function statusText(group: GroupSummary) {
  if (group.myNetCents > 0) {
    return {
      label: "you are owed",
      value: formatMoney(group.myNetCents, group.currencyCode),
      className: "text-ui-success"
    };
  }

  if (group.myNetCents < 0) {
    return {
      label: "you owe",
      value: formatMoney(Math.abs(group.myNetCents), group.currencyCode),
      className: "text-ui-warn"
    };
  }

  return {
    label: "settled",
    value: formatMoney(0, group.currencyCode),
    className: "text-ui-muted"
  };
}

export function GroupListRow({ group }: { group: GroupSummary }) {
  const status = statusText(group);

  return (
    <Link href={`/groups/${group.id}` as Route} className="group-row">
      <div className="group-row-avatar" style={{ backgroundImage: seedToGradient(group.heroSeed) }}>
        <span>{group.name.slice(0, 1).toUpperCase()}</span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[1.95rem] font-semibold leading-tight text-ui-ink">{group.name}</p>
        <p className="mt-1 truncate text-[1.65rem] text-ui-muted">{summaryText(group)}</p>
      </div>
      <div className="text-right">
        <p className={`text-[1.4rem] font-medium ${status.className}`}>{status.label}</p>
        <p className={`text-[2rem] font-semibold leading-tight ${status.className}`}>{status.value}</p>
      </div>
    </Link>
  );
}

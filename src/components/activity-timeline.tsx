import { formatMoney } from "@/lib/money";
import { seedToGradient } from "@/lib/visual-seed";
import type { ExpenseFeedItem, SettlementFeedItem } from "@/lib/types";

type TimelineMode = "SETTLE" | "EXPENSES";

type TimelineProps = {
  currencyCode: string;
  expenses: ExpenseFeedItem[];
  settlements: SettlementFeedItem[];
  mode: TimelineMode;
};

type TimelineItem = {
  id: string;
  timestamp: number;
  dateLabel: string;
  monthLabel: string;
  kind: "expense" | "settlement";
  title: string;
  subtitle: string;
  tone: "positive" | "negative" | "neutral";
  amountText?: string;
  toneText?: string;
};

function toDateParts(isoString: string) {
  const date = new Date(isoString);
  return {
    timestamp: date.getTime(),
    day: new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date),
    monthShort: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
    monthLong: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date)
  };
}

function buildItems(props: TimelineProps): TimelineItem[] {
  const expenseItems = props.expenses.map((expense) => {
      const parts = toDateParts(expense.spentAt);
      const paidByName = expense.paidByMember.user.name || expense.paidByMember.user.email;

      if (expense.myDirection === "LENT") {
        return {
          id: expense.id,
          timestamp: parts.timestamp,
          dateLabel: `${parts.monthShort} ${parts.day}`,
          monthLabel: parts.monthLong,
          kind: "expense" as const,
          title: expense.title,
          subtitle: `${paidByName} paid ${formatMoney(expense.amountCents, props.currencyCode)}`,
          tone: "positive" as const,
          toneText: "you lent",
          amountText: formatMoney(expense.myDeltaCents, props.currencyCode)
        };
      }

      if (expense.myDirection === "BORROWED") {
        return {
          id: expense.id,
          timestamp: parts.timestamp,
          dateLabel: `${parts.monthShort} ${parts.day}`,
          monthLabel: parts.monthLong,
          kind: "expense" as const,
          title: expense.title,
          subtitle: `${paidByName} paid ${formatMoney(expense.amountCents, props.currencyCode)}`,
          tone: "negative" as const,
          toneText: "you borrowed",
          amountText: formatMoney(Math.abs(expense.myDeltaCents), props.currencyCode)
        };
      }

      return {
        id: expense.id,
        timestamp: parts.timestamp,
        dateLabel: `${parts.monthShort} ${parts.day}`,
        monthLabel: parts.monthLong,
        kind: "expense" as const,
        title: expense.title,
        subtitle: `${paidByName} paid ${formatMoney(expense.amountCents, props.currencyCode)}`,
        tone: "neutral" as const
      };
  });

  const settlementItems = props.mode === "SETTLE"
    ? props.settlements.map((settlement) => {
        const parts = toDateParts(settlement.paidAt);
        const fromName = settlement.fromMember.user.name || settlement.fromMember.user.email;
        const toName = settlement.toMember.user.name || settlement.toMember.user.email;

        return {
          id: settlement.id,
          timestamp: parts.timestamp,
          dateLabel: `${parts.monthShort} ${parts.day}`,
          monthLabel: parts.monthLong,
          kind: "settlement" as const,
          title: `${fromName} fully settled up with ${toName}`,
          subtitle: formatMoney(settlement.amountCents, props.currencyCode),
          tone: "neutral" as const
        };
      })
    : [];

  return [...expenseItems, ...settlementItems].sort((a, b) => b.timestamp - a.timestamp);
}

export function ActivityTimeline(props: TimelineProps) {
  const items = buildItems(props);

  if (items.length === 0) {
    return <p className="mt-6 text-[1.75rem] text-ui-muted">No activity yet.</p>;
  }

  let activeMonth = "";

  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => {
        const showMonth = item.monthLabel !== activeMonth;
        activeMonth = item.monthLabel;

        return (
          <div key={`${item.kind}-${item.id}`}>
            {showMonth ? <h3 className="timeline-month">{item.monthLabel}</h3> : null}
            <article className="timeline-row">
              <div className="timeline-date">{item.dateLabel}</div>
              <div className="timeline-icon" style={{ backgroundImage: seedToGradient(item.id) }} aria-hidden="true">
                {item.kind === "settlement" ? "⚖" : "🧾"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[2.1rem] font-semibold leading-tight text-ui-ink">{item.title}</p>
                <p className="truncate text-[1.8rem] text-ui-muted">{item.subtitle}</p>
              </div>
              {item.amountText ? (
                <div className="text-right">
                  <p className={`text-[1.55rem] font-medium ${item.tone === "positive" ? "text-ui-success" : "text-ui-warn"}`}>
                    {item.toneText}
                  </p>
                  <p className={`text-[2.25rem] font-semibold leading-tight ${item.tone === "positive" ? "text-ui-success" : "text-ui-warn"}`}>
                    {item.amountText}
                  </p>
                </div>
              ) : null}
            </article>
          </div>
        );
      })}
    </div>
  );
}

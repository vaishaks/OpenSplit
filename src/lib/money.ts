export function formatMoney(amountCents: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountCents / 100);
}

export function parseMoneyToCents(input: string): number {
  const normalized = input.replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.round(parsed * 100);
}

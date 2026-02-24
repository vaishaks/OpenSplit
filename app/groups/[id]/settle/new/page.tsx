import { requireAuthSession } from "@/components/require-auth";
import { AddSettlementForm } from "@/components/add-settlement-form";

export default async function NewSettlementPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    fromMemberId?: string;
    toMemberId?: string;
    amountCents?: string;
  }>;
}) {
  await requireAuthSession();
  const { id } = await params;
  const query = await searchParams;
  const parsedAmount =
    typeof query.amountCents === "string" ? Number.parseInt(query.amountCents, 10) : undefined;

  return (
    <section className="mx-auto max-w-2xl">
      <AddSettlementForm
        groupId={id}
        initialFromMemberId={query.fromMemberId}
        initialToMemberId={query.toMemberId}
        initialAmountCents={Number.isFinite(parsedAmount) ? parsedAmount : undefined}
      />
    </section>
  );
}

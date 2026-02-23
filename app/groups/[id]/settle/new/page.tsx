import { requireAuthSession } from "@/components/require-auth";
import { AddSettlementForm } from "@/components/add-settlement-form";

export default async function NewSettlementPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthSession();
  const { id } = await params;

  return (
    <section className="mx-auto max-w-2xl">
      <AddSettlementForm groupId={id} />
    </section>
  );
}

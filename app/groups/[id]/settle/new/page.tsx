import { requireAuthSession } from "@/components/require-auth";
import { AddSettlementForm } from "@/components/add-settlement-form";

export default async function NewSettlementPage({ params }: { params: { id: string } }) {
  await requireAuthSession();
  const { id } = await Promise.resolve(params);

  return (
    <section className="mx-auto max-w-2xl">
      <AddSettlementForm groupId={id} />
    </section>
  );
}

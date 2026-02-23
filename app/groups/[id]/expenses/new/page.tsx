import { requireAuthSession } from "@/components/require-auth";
import { AddExpenseForm } from "@/components/add-expense-form";

export default async function NewExpensePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthSession();
  const { id } = await params;

  return (
    <section className="mx-auto max-w-2xl">
      <AddExpenseForm groupId={id} />
    </section>
  );
}

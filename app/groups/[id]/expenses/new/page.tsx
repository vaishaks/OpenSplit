import { requireAuthSession } from "@/components/require-auth";
import { AddExpenseForm } from "@/components/add-expense-form";

export default async function NewExpensePage({ params }: { params: { id: string } }) {
  await requireAuthSession();
  const { id } = await Promise.resolve(params);

  return (
    <section className="mx-auto max-w-2xl">
      <AddExpenseForm groupId={id} />
    </section>
  );
}

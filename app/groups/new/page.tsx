import { requireAuthSession } from "@/components/require-auth";
import { CreateGroupForm } from "@/components/create-group-form";

export default async function NewGroupPage() {
  await requireAuthSession();

  return (
    <section className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-black text-ink">Create a Group</h1>
      <p className="text-sm text-muted">Set up a shared space for expenses and balances.</p>
      <CreateGroupForm />
    </section>
  );
}

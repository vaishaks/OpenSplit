import { requireAuthSession } from "@/components/require-auth";
import { GroupBalancesView } from "@/components/group-balances-view";

export default async function GroupBalancesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthSession();
  const { id } = await params;

  return <GroupBalancesView groupId={id} />;
}

import { requireAuthSession } from "@/components/require-auth";
import { GroupDetailView } from "@/components/group-detail-view";
import { InviteControls } from "@/components/invite-controls";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthSession();
  const { id } = await params;

  return (
    <section className="space-y-4">
      <GroupDetailView groupId={id} />
      <InviteControls groupId={id} />
    </section>
  );
}

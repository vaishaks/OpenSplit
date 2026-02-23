import { requireAuthSession } from "@/components/require-auth";
import { GroupDetailView } from "@/components/group-detail-view";
import { InviteControls } from "@/components/invite-controls";

export default async function GroupPage({ params }: { params: { id: string } }) {
  await requireAuthSession();
  const { id } = await Promise.resolve(params);

  return (
    <section className="space-y-4">
      <GroupDetailView groupId={id} />
      <InviteControls groupId={id} />
    </section>
  );
}

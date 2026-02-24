import { requireAuthSession } from "@/components/require-auth";
import { GroupDetailView } from "@/components/group-detail-view";
import { GroupsRail } from "@/components/groups-rail";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthSession();
  const { id } = await params;

  return (
    <section className="min-h-screen bg-ui-bg lg:grid lg:grid-cols-[380px_1fr]">
      <div className="hidden lg:block">
        <GroupsRail activeGroupId={id} isDesktopRail />
      </div>
      <GroupDetailView groupId={id} />
    </section>
  );
}

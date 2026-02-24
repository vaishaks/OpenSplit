import { requireAuthSession } from "@/components/require-auth";
import { GroupPeopleView } from "@/components/group-people-view";

export default async function GroupPeoplePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthSession();
  const { id } = await params;

  return <GroupPeopleView groupId={id} />;
}

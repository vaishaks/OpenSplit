import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { InviteJoinCard } from "@/components/invite-join-card";

export default async function InvitePage({ params }: { params: { token: string } }) {
  const session = await auth();
  const { token } = await Promise.resolve(params);
  if (!session?.user) {
    redirect(`/?invite=${token}`);
  }

  return <InviteJoinCard token={token} />;
}

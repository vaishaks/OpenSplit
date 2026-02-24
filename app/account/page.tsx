import { requireAuthSession } from "@/components/require-auth";
import { AccountView } from "@/components/account-view";

export default async function AccountPage() {
  await requireAuthSession();
  return <AccountView />;
}

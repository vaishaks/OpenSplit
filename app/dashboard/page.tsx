import { requireAuthSession } from "@/components/require-auth";
import { DashboardView } from "@/components/dashboard-view";

export default async function DashboardPage() {
  await requireAuthSession();
  return <DashboardView />;
}

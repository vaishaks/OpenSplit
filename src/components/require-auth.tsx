import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export async function requireAuthSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  return session;
}

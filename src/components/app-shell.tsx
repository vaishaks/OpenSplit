"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAppRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/groups") || pathname.startsWith("/account");
  const hideBottomNav = pathname.endsWith("/new") || pathname.endsWith("/balances");

  return (
    <>
      {!isAppRoute ? <TopNav /> : null}
      <main className={isAppRoute ? "app-main app-main-mobile" : "app-main app-main-marketing"}>{children}</main>
      {isAppRoute && !hideBottomNav ? <BottomNav /> : null}
    </>
  );
}

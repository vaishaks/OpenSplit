"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

function GroupsIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-6 w-6 ${active ? "text-ui-success" : "text-ui-muted"}`}>
      <path
        fill="currentColor"
        d="M16 11a3 3 0 1 0-2.999-3A3 3 0 0 0 16 11Zm-8 0A3 3 0 1 0 5 8a3 3 0 0 0 3 3Zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-.9.29-1.73.79-2.42A13.5 13.5 0 0 0 8 13Zm8 0c-.29 0-.62.02-.97.05A4.9 4.9 0 0 1 18 17v2h6v-2c0-2.66-5.33-4-8-4Z"
      />
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-6 w-6 ${active ? "text-ui-success" : "text-ui-muted"}`}>
      <path
        fill="currentColor"
        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
      />
    </svg>
  );
}

const navItems = [
  {
    href: "/dashboard" as Route,
    label: "Groups",
    icon: GroupsIcon,
    match: (pathname: string) => pathname === "/dashboard" || pathname.startsWith("/groups")
  },
  {
    href: "/account" as Route,
    label: "Account",
    icon: AccountIcon,
    match: (pathname: string) => pathname.startsWith("/account")
  }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="app-bottom-nav lg:hidden" aria-label="Primary">
      <ul className="grid grid-cols-2">
        {navItems.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} className="bottom-nav-link">
                <Icon active={active} />
                <span className={active ? "text-ui-success" : "text-ui-muted"}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

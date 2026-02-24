import Link from "next/link";
import { AuthButtons } from "@/components/auth-buttons";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-ui-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-black tracking-tight text-ui-ink">
          OpenSplit
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium text-ui-muted hover:text-ui-ink">
            Dashboard
          </Link>
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}

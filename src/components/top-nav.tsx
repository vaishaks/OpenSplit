import Link from "next/link";
import { AuthButtons } from "@/components/auth-buttons";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-black tracking-tight text-ink">
          OpenSplit
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium text-ink/80 hover:text-ink">
            Dashboard
          </Link>
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}

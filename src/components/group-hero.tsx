import Link from "next/link";
import type { Route } from "next";
import { seedToGradient, seedToHue } from "@/lib/visual-seed";

export function GroupHero({
  groupId,
  title,
  heroSeed,
  dateLabel,
  memberCount
}: {
  groupId: string;
  title: string;
  heroSeed: string;
  dateLabel: string;
  memberCount: number;
}) {
  const patternHue = (seedToHue(heroSeed) + 20) % 360;

  return (
    <header className="group-hero" style={{ backgroundImage: seedToGradient(heroSeed) }}>
      <div
        className="group-hero-pattern"
        style={{ backgroundColor: `hsl(${patternHue} 74% 44% / 0.28)` }}
        aria-hidden="true"
      />
      <div className="group-hero-actions">
        <Link href="/dashboard" className="icon-chip" aria-label="Back to groups">
          <span aria-hidden="true">←</span>
        </Link>
        <Link href={`/groups/${groupId}/balances` as Route} className="icon-chip" aria-label="Open balances">
          <span aria-hidden="true">⚙</span>
        </Link>
      </div>
      <h1 className="group-hero-title">{title}</h1>
      <div className="group-hero-meta">
        <span className="hero-pill">{dateLabel}</span>
        <span className="hero-pill">{memberCount} people</span>
      </div>
    </header>
  );
}

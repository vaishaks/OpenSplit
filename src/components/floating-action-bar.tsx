import Link from "next/link";
import type { Route } from "next";

export function FloatingActionBar({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref
}: {
  primaryLabel: string;
  primaryHref: Route;
  secondaryLabel?: string;
  secondaryHref?: Route;
}) {
  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-30 flex flex-col items-end gap-3 lg:bottom-8 lg:right-8">
      {secondaryLabel && secondaryHref ? (
        <Link
          href={secondaryHref}
          className="pointer-events-auto rounded-full bg-white px-6 py-3 text-lg font-semibold text-ui-ink shadow-[0_14px_30px_rgba(31,41,55,0.18)]"
        >
          {secondaryLabel}
        </Link>
      ) : null}
      <Link
        href={primaryHref}
        className="pointer-events-auto rounded-full bg-ui-success px-8 py-4 text-xl font-semibold text-white shadow-[0_20px_36px_rgba(15,159,101,0.35)]"
      >
        {primaryLabel}
      </Link>
    </div>
  );
}

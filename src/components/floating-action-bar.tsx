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
    <div className="pointer-events-none fixed bottom-24 right-4 z-30 flex flex-col items-end gap-2 lg:bottom-8 lg:right-8">
      {secondaryLabel && secondaryHref ? (
        <Link
          href={secondaryHref}
          className="pointer-events-auto rounded-full bg-white px-5 py-2 text-base font-semibold text-ui-ink shadow-[0_14px_30px_rgba(31,41,55,0.18)]"
        >
          {secondaryLabel}
        </Link>
      ) : null}
      <Link
        href={primaryHref}
        className="pointer-events-auto rounded-full bg-ui-success px-7 py-3 text-lg font-semibold text-white shadow-[0_18px_32px_rgba(15,159,101,0.35)]"
      >
        {primaryLabel}
      </Link>
    </div>
  );
}

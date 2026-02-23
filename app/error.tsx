"use client";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-3 rounded-2xl bg-white p-6 text-center shadow-card">
      <h2 className="text-2xl font-black text-ink">Something went wrong</h2>
      <p className="text-sm text-muted">{error.message || "Unexpected application error"}</p>
      <button
        onClick={() => reset()}
        className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}

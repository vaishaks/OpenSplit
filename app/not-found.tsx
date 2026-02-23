import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 text-center shadow-card">
      <h1 className="text-2xl font-black text-ink">Not Found</h1>
      <p className="mt-2 text-sm text-muted">The page you requested does not exist.</p>
      <Link href="/dashboard" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
        Go to Dashboard
      </Link>
    </div>
  );
}

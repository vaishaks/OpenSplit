"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body>
        <div className="mx-auto mt-16 max-w-lg rounded-2xl bg-white p-6 text-center shadow-card">
          <h1 className="text-2xl font-black text-ink">Fatal Error</h1>
          <p className="mt-2 text-sm text-muted">{error.message || "An unrecoverable error occurred."}</p>
        </div>
      </body>
    </html>
  );
}

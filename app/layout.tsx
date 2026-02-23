import type { Metadata } from "next";
import { Space_Grotesk, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TopNav } from "@/components/top-nav";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "700"]
});

const bodyFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "OpenSplit",
  description: "A transparent group expense splitter for roommates, trips, and events"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen bg-zinc-50 text-ink">
        <Providers>
          <TopNav />
          <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

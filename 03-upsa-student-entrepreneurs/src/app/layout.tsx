import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import config from "@/survey.config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: config.shortTitle,
  description: config.title,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ "--accent": config.accent } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="no-print border-b border-border bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="inline-block h-3 w-3 rounded-full bg-accent" aria-hidden />
              {config.shortTitle}
            </Link>
            <nav className="flex gap-4 text-sm text-muted">
              <Link href="/survey" className="hover:text-foreground">
                Questionnaire
              </Link>
              <Link href="/admin" className="hover:text-foreground">
                Researchers
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="no-print border-t border-border px-4 py-4 text-center text-xs text-muted">
          {config.institution} · Accounting &amp; Information Technology undergraduate project
        </footer>
      </body>
    </html>
  );
}

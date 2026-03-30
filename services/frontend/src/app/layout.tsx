import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LMS POC",
  description: "Mini LMS – Students, Parents, Classes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-indigo-700 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-8">
            <span className="font-bold text-lg tracking-tight">🏫 LMS POC</span>
            <Link
              href="/classes"
              className="text-sm hover:text-indigo-200 transition-colors"
            >
              Classes
            </Link>
            <Link
              href="/parents"
              className="text-sm hover:text-indigo-200 transition-colors"
            >
              Parents
            </Link>
            <Link
              href="/students"
              className="text-sm hover:text-indigo-200 transition-colors"
            >
              Students
            </Link>
            <Link
              href="/subscriptions"
              className="text-sm hover:text-indigo-200 transition-colors"
            >
              Subscriptions
            </Link>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

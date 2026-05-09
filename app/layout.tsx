import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "M-IAE — Expense Tracker",
  description: "Track shared expenses with your partner",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className="h-full">
      <body className="h-full">
        <main className="max-w-md mx-auto min-h-svh pb-24 px-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

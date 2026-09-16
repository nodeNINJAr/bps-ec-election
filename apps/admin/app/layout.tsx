import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPS EC Election-2026 Admin",
  description: "Nomination responses admin panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

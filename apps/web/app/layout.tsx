import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPS EC Election-2026 (Nomination Form Submission)",
  description: "BPS EC Election-2026 Nomination Form",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

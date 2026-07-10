import type { Metadata } from "next";
import { Saira_Stencil_One } from "next/font/google";
import "./globals.css";

const sairaStencil = Saira_Stencil_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-saira-stencil",
});

export const metadata: Metadata = {
  title: "Levera — AI-Powered DSA Mentor",
  description:
    "From Brute Force to Optimal, Instantly. Learn Data Structures & Algorithms with AI that teaches you how to think.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sairaStencil.variable}>{children}</body>
    </html>
  );
}

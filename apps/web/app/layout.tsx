import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import { ThemeProvider } from "@/components/theme-context";
import "./globals.css";
import { cn } from "@/lib/utils";

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
});

const tiemposText = localFont({
  src: [
    { path: "./fonts/tiempos-text-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/tiempos-text-regular-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-tiempos",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Levera | AI-Powered DSA Mentor",
  description:
    "From Brute Force to Optimal, Instantly. Learn Data Structures & Algorithms with AI that teaches you how to think.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark font-sans", exo2.variable, tiemposText.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${exo2.variable} ${tiemposText.variable} font-sans`}
      >
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#141414",
              color: "#ededed",
              border: "1px solid #2a2a2a",
              fontFamily: "var(--font-tiempos), Georgia, Cambria, \"Times New Roman\", Times, serif",
              fontSize: "0.875rem",
              borderRadius: "8px",
              padding: "12px 16px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            },
            success: {
              iconTheme: {
                primary: "#f97316",
                secondary: "#141414",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#141414",
              },
            },
          }}
        />
      </body>
    </html>
  );
}

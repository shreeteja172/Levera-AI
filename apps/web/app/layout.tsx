import type { Metadata } from "next";
import { Saira_Stencil_One, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const sairaStencil = Saira_Stencil_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-saira-stencil",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
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
      <body className={`${sairaStencil.variable} ${plusJakarta.variable}`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#141414",
              color: "#ededed",
              border: "1px solid #2a2a2a",
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              fontSize: "0.875rem",
              borderRadius: "8px",
              padding: "12px 16px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            },
            success: {
              iconTheme: {
                primary: "#f97316", // Levera primary orange accent
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


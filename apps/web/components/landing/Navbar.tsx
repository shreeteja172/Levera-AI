"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useLandingTheme } from "./theme-context";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-medium text-lg text-white! landing-light:text-zinc-900! shrink-0"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-orange-500"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
      <span className="tracking-tight">Levera</span>
    </Link>
  );
}

function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useLandingTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 landing-light:text-zinc-500 hover:text-white landing-light:hover:text-zinc-900 hover:bg-zinc-800/60 landing-light:hover:bg-black/5 transition-colors ${className}`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-4 md:top-6 inset-x-0 z-50 px-4 font-sans">
      <nav
        className="max-w-5xl mx-auto grid grid-cols-3 items-center gap-4 h-14 md:h-16 px-4 md:px-6
        rounded-2xl border border-zinc-800/80 landing-light:border-black/10 bg-zinc-900/70 landing-light:bg-[#F5F3EE]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] landing-light:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
      >
        <div className="hidden md:flex items-center gap-7 justify-self-start">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-400! landing-light:text-zinc-600! hover:text-white! landing-light:hover:text-zinc-900! transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden justify-self-start text-zinc-400 landing-light:text-zinc-600 hover:text-white landing-light:hover:text-zinc-900 p-1.5 rounded-lg hover:bg-zinc-800/60 landing-light:hover:bg-black/5"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="justify-self-center">
          <Logo />
        </div>

        <div className="hidden md:flex items-center gap-3 justify-self-end">
          <ThemeToggle />
          {!isPending && session?.user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2 bg-zinc-100 hover:bg-white landing-light:bg-zinc-900 landing-light:hover:bg-zinc-800 text-black! landing-light:text-white! rounded-lg text-sm font-medium transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="px-4 py-2 text-sm text-zinc-300! landing-light:text-zinc-700! hover:text-white! landing-light:hover:text-zinc-900! transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-5 py-2 bg-zinc-100 hover:bg-white landing-light:bg-zinc-900 landing-light:hover:bg-zinc-800 text-black! landing-light:text-white! rounded-lg text-sm font-medium transition-colors"
              >
                Start Learning Free
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden justify-self-end">
          <ThemeToggle />
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden max-w-5xl mx-auto mt-2 rounded-2xl border border-zinc-800/80 landing-light:border-black/10 bg-zinc-950/95 landing-light:bg-[#F5F3EE]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] landing-light:shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm text-zinc-400! landing-light:text-zinc-600! hover:text-white! landing-light:hover:text-zinc-900! transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-zinc-900/60 landing-light:border-black/10">
            {!isPending && session?.user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-5 py-2.5 bg-zinc-100 hover:bg-white landing-light:bg-zinc-900 landing-light:hover:bg-zinc-800 text-black! landing-light:text-white! rounded-lg text-sm font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-5 py-2.5 text-sm text-zinc-300! landing-light:text-zinc-700! hover:text-white! landing-light:hover:text-zinc-900! border border-zinc-800 landing-light:border-black/10 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-5 py-2.5 bg-zinc-100 hover:bg-white landing-light:bg-zinc-900 landing-light:hover:bg-zinc-800 text-black! landing-light:text-white! rounded-lg text-sm font-medium transition-colors"
                >
                  Start Learning Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

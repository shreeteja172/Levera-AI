"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex items-center gap-2.5 shrink-0 text-zinc-900! dark:text-white!"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#FF5A1F]"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
      <span className="font-instrument text-lg tracking-tight">Levera</span>
    </Link>
  );
}

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 12;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const signedIn = !isPending && session?.user;

  return (
    <>
      <header className="fixed top-4 md:top-6 inset-x-0 z-50 px-4 md:px-6">
        <nav
          className={`max-w-5xl mx-auto h-14 md:h-16 pl-5 pr-3 md:pl-7 md:pr-4 rounded-full flex items-center justify-between gap-6 transition-all duration-300 ${
            scrolled && !mobileOpen
              ? "bg-[#EAE7DF]/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-900/12 dark:border-white/12 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
              : "bg-[#EAE7DF]/50 dark:bg-zinc-950/50 backdrop-blur-md border border-zinc-900/8 dark:border-white/8"
          }`}
        >
          <Logo />

          <div className="hidden md:flex items-center gap-9">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500! hover:text-zinc-900! dark:hover:text-white! transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <ThemeToggle />

            {signedIn ? (
              <Link
                href="/dashboard"
                className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white! dark:text-black! text-xs transition-transform duration-300 hover:-translate-y-0.5"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="hidden md:inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500! hover:text-zinc-900! dark:hover:text-white! transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white! dark:text-black! text-xs transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Start free
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-[5px] text-zinc-900 dark:text-white"
            >
              <span
                className={`block w-5 h-px bg-current transition-transform duration-300 ${
                  mobileOpen ? "translate-y-[3px] rotate-45" : ""
                }`}
              />
              <span
                className={`block w-5 h-px bg-current transition-transform duration-300 ${
                  mobileOpen ? "-translate-y-[3px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 md:hidden bg-[#EAE7DF] dark:bg-zinc-950 flex flex-col justify-between pt-24 pb-12 px-6"
          >
            <ul className="flex flex-col">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.05 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="border-b border-zinc-900/12 dark:border-white/12"
                >
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-baseline gap-4 py-6 text-zinc-900! dark:text-white!"
                  >
                    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-instrument text-3xl tracking-tight">
                      {link.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col gap-4"
            >
              {signedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-6 py-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white! dark:text-black! text-sm"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-6 py-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white! dark:text-black! text-sm"
                  >
                    Start free
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center font-mono text-[10px] tracking-[0.25em] uppercase text-zinc-500! py-2"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

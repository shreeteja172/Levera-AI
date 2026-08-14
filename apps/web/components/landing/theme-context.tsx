/* eslint-disable @next/next/no-before-interactive-script-outside-document */
"use client";

import Script from "next/script";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "levera_landing_theme";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "dark",
  toggleTheme: () => {},
});

export function LandingThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Script
        id="landing-theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem(${JSON.stringify(
            STORAGE_KEY,
          )});var el=document.getElementById("landing-theme-root");if(el&&t==="light"){el.classList.add("landing-light");}}catch(e){}`,
        }}
      />
      <div
        id="landing-theme-root"
        className={theme === "light" ? "landing-light" : ""}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useLandingTheme() {
  return useContext(ThemeContext);
}

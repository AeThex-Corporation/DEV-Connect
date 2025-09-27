import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";

type Ctx = { theme: Theme; setTheme: (t: Theme) => void; isDark: boolean; toggle: () => void };
const ThemeCtx = createContext<Ctx | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && isSystemDark);
  root.classList.toggle('dark', dark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      applyTheme(theme);
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    handler();
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState((prev) => (document.documentElement.classList.contains('dark') ? 'light' : 'dark'));

  const value = useMemo<Ctx>(() => ({ theme, setTheme, isDark: isDark, toggle }), [theme, isDark]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

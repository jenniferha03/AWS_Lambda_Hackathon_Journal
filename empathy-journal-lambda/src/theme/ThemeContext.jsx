import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "empathy_theme_mode";
/** Keep in sync with `html.dark` overscroll in `index.css` */
const THEME_COLOR_LIGHT = "#fff8f1";
const THEME_COLOR_DARK = "#0e1528";

function syncThemeColor(isDark) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
}

function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    syncThemeColor(theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  const value = useMemo(() => ({ theme, isDark: theme === "dark", toggleTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}


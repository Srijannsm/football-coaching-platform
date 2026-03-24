import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./theme-context";
import { getSavedTheme, setTheme as persistTheme, THEMES } from "../utils/theme";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getSavedTheme);

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  function setTheme(nextTheme) {
    if (nextTheme !== THEMES.LIGHT && nextTheme !== THEMES.DARK) {
      return;
    }

    setThemeState(nextTheme);
  }

  function toggleTheme() {
    setThemeState((prev) =>
      prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    );
  }

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === THEMES.DARK,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
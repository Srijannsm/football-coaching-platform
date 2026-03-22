import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSavedTheme, setTheme as persistTheme, THEMES } from "../utils/theme";

const ThemeContext = createContext(null);

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

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }

    return context;
}
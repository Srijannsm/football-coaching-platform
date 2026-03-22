export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

const STORAGE_KEY = "app-theme";

export function getSavedTheme() {
  if (typeof window === "undefined") {
    return THEMES.LIGHT;
  }

  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme === THEMES.LIGHT || savedTheme === THEMES.DARK) {
    return savedTheme;
  }

  return THEMES.LIGHT;
}

export function applyTheme(theme) {
  const root = document.documentElement;

  root.setAttribute("data-theme", theme);

  if (theme === THEMES.DARK) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function setTheme(theme) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function initializeTheme() {
  const theme = getSavedTheme();
  applyTheme(theme);
  return theme;
}
export const THEME_KEY = "app-theme";

export const THEMES = {
  DEFAULT: "default",
  DARK: "dark",
  PITCH: "pitch",
};

export function applyTheme(theme) {
  if (!theme || theme === THEMES.DEFAULT) {
    document.documentElement.removeAttribute("data-theme");
    return;
  }

  document.documentElement.setAttribute("data-theme", theme);
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || THEMES.DEFAULT;
}

export function setTheme(theme) {
  applyTheme(theme);
  saveTheme(theme);
}
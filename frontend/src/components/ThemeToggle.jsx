import { useEffect, useRef, useState } from "react";
import { getSavedTheme, setTheme, THEMES } from "../utils/theme";

const themeOptions = [
  { value: THEMES.DEFAULT, label: "Default", icon: "☀" },
  { value: THEMES.DARK, label: "Dark", icon: "☾" },
  // { value: THEMES.PITCH, label: "Pitch", icon: "⚽" },
];

function ThemeToggle({ inverted = false }) {
  const [currentTheme, setCurrentTheme] = useState(THEMES.DEFAULT);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setCurrentTheme(getSavedTheme());
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleThemeChange(theme) {
    setCurrentTheme(theme);
    setTheme(theme);
    setOpen(false);
  }

  const activeTheme =
    themeOptions.find((option) => option.value === currentTheme) ||
    themeOptions[0];

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-base shadow-[var(--shadow-soft)] transition ${
          inverted
            ? "border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/14"
            : "border-app-border bg-app-card text-app-text hover:border-brand-primary hover:text-brand-primary"
        }`}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Theme: ${activeTheme.label}`}
      >
        <span className="leading-none">{activeTheme.icon}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-44 rounded-[1rem] border border-app-border bg-app-card p-2 shadow-[var(--shadow-premium)] animate-fade-in">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-app-text-muted">
            Theme
          </p>

          <div className="flex flex-col gap-1">
            {themeOptions.map((option) => {
              const isActive = currentTheme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleThemeChange(option.value)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-primary-soft text-app-text"
                      : "text-app-text-soft hover:bg-app-surface-2 hover:text-app-text"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{option.icon}</span>
                    <span>{option.label}</span>
                  </span>

                  {isActive ? (
                    <span className="text-xs font-bold text-brand-primary">
                      Active
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
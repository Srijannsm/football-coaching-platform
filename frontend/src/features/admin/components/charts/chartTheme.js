/**
 * Reads a CSS variable from :root's computed styles.
 * This allows recharts SVG elements to use our theme variables.
 */
export function getThemeVar(name) {
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue(name).trim();
}

export function getChartColors() {
  return {
    tickFill: getThemeVar('--app-text-muted') || '#6b7280',
    gridColor: getThemeVar('--app-border') || '#d1d5db',
    tooltipBg: getThemeVar('--app-card-bg') || '#ffffff',
    tooltipBorder: getThemeVar('--app-border') || '#d1d5db',
    tooltipText: getThemeVar('--app-text') || '#111827',
    tooltipMuted: getThemeVar('--app-text-muted') || '#6b7280',
    emptyText: getThemeVar('--app-text-muted') || '#6b7280',
  };
}

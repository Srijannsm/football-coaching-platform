const accentMap = {
  yellow: {
    iconWrap: "bg-app-accent-yellow-bg text-app-accent-yellow-text border-app-accent-yellow-border",
    border: "border-l-app-accent-yellow-text",
  },
  blue: {
    iconWrap: "bg-app-accent-blue-bg text-app-accent-blue-text border-app-accent-blue-border",
    border: "border-l-app-accent-blue-text",
  },
  emerald: {
    iconWrap: "bg-app-accent-emerald-bg text-app-accent-emerald-text border-app-accent-emerald-border",
    border: "border-l-app-accent-emerald-text",
  },
  purple: {
    iconWrap: "bg-app-accent-violet-bg text-app-accent-violet-text border-app-accent-violet-border",
    border: "border-l-app-accent-violet-text",
  },
};

function AdminStatCard({
  title,
  value,
  helperText,
  icon: Icon,
  accent = "yellow",
}) {
  const styles = accentMap[accent] || accentMap.yellow;

  return (
    <div
      className={`group rounded-2xl border border-app-border bg-app-card shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-premium)] border-l-4 ${styles.border}`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-app-text-muted">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-app-text">
              {value ?? 0}
            </p>
            {helperText ? (
              <p className="mt-2 text-xs text-app-text-muted">{helperText}</p>
            ) : null}
          </div>

          {Icon ? (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${styles.iconWrap} transition-transform duration-200 group-hover:scale-105`}
            >
              <Icon size={22} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AdminStatCard;

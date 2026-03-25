import AdminCard from "./AdminCard";

const accentMap = {
  yellow: {
    iconWrap: "bg-yellow-500/12 text-yellow-600 dark:text-yellow-300",
    glow: "group-hover:border-yellow-400/30 group-hover:shadow-[0_18px_40px_rgba(234,179,8,0.10)]",
    line: "from-yellow-400/70 via-yellow-300/30 to-transparent",
    badge: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  },
  blue: {
    iconWrap: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
    glow: "group-hover:border-sky-400/30 group-hover:shadow-[0_18px_40px_rgba(14,165,233,0.10)]",
    line: "from-sky-400/70 via-sky-300/30 to-transparent",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  emerald: {
    iconWrap: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    glow: "group-hover:border-emerald-400/30 group-hover:shadow-[0_18px_40px_rgba(16,185,129,0.10)]",
    line: "from-emerald-400/70 via-emerald-300/30 to-transparent",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  purple: {
    iconWrap: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
    glow: "group-hover:border-violet-400/30 group-hover:shadow-[0_18px_40px_rgba(139,92,246,0.10)]",
    line: "from-violet-400/70 via-violet-300/30 to-transparent",
    badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
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
    <AdminCard
      className={`group relative h-full overflow-hidden border-app-border transition-all duration-300 hover:-translate-y-1 ${styles.glow}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${styles.line}`}
      />

      <div className="relative flex h-full flex-col justify-between gap-6 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${styles.badge}`}
            >
              Metric
            </div>

            <p className="mt-3 text-sm font-semibold text-app-text-muted">
              {title}
            </p>

            <p className="mt-2 text-3xl font-black tracking-tight text-app-text sm:text-[2rem]">
              {value}
            </p>
          </div>

          {Icon ? (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/5 ${styles.iconWrap} transition-transform duration-300 group-hover:scale-105`}
            >
              <Icon size={22} />
            </div>
          ) : null}
        </div>

        {helperText ? (
          <div className="border-t border-app-border pt-4">
            <p className="text-sm leading-6 text-app-text-muted">
              {helperText}
            </p>
          </div>
        ) : null}
      </div>
    </AdminCard>
  );
}

export default AdminStatCard;
import AdminCard from "./AdminCard";

const accentMap = {
  yellow: {
    iconWrap: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-300",
  },
  blue: {
    iconWrap: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  },
  emerald: {
    iconWrap: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  },
  purple: {
    iconWrap: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
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
    <AdminCard className="h-full">
      <div className="flex h-full flex-col justify-between gap-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-app-text-muted">{title}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-app-text">
              {value}
            </p>
          </div>

          {Icon ? (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}
            >
              <Icon size={22} />
            </div>
          ) : null}
        </div>

        {helperText ? (
          <p className="text-sm leading-6 text-app-text-muted">{helperText}</p>
        ) : null}
      </div>
    </AdminCard>
  );
}

export default AdminStatCard;
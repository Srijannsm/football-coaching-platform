import { getStatusVariant } from "../../utils/getStatusVariant";

const variantClasses = {
  success: {
    base: "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  warning: {
    base: "border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  danger: {
    base: "border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-300",
    dot: "bg-red-500",
  },
  neutral: {
    base: "border-slate-400/30 bg-slate-500/10 text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

function formatLabel(label) {
  if (!label) return "Unknown";

  return label
    .toString()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function AdminStatusBadge({ label, status }) {
  const variant = getStatusVariant(status || label);
  const styles = variantClasses[variant] || variantClasses.neutral;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${styles.base}`}
    >
      {/* Dot indicator */}
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} />

      {/* Label */}
      <span>{formatLabel(label)}</span>
    </span>
  );
}

export default AdminStatusBadge;
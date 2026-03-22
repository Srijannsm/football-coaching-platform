import { getStatusVariant } from "../../utils/getStatusVariant";

const variantClasses = {
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  danger: "bg-red-500/15 text-red-300 border-red-500/20",
  neutral: "bg-slate-500/15 text-slate-300 border-slate-500/20",
};

function AdminStatusBadge({ label, status }) {
  const variant = getStatusVariant(status || label);

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${variantClasses[variant]}`}>
      {label}
    </span>
  );
}

export default AdminStatusBadge;

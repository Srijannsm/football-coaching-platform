import { getStatusVariant } from "../../utils/getStatusVariant";

const variantClasses = {
  success: "bg-app-success-bg text-app-success-text border-app-success-border",
  warning: "bg-app-warning-bg text-app-warning-text border-app-warning-border",
  danger: "bg-app-danger-bg text-app-danger-text border-app-danger-border",
  neutral: "bg-app-neutral-bg text-app-neutral-text border-app-neutral-border",
};

const dotClasses = {
  success: "bg-app-success-text",
  warning: "bg-app-warning-text",
  danger: "bg-app-danger-text",
  neutral: "bg-app-neutral-text",
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
  const badgeCls = variantClasses[variant] || variantClasses.neutral;
  const dotCls = dotClasses[variant] || dotClasses.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${badgeCls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
      {formatLabel(label)}
    </span>
  );
}

export default AdminStatusBadge;

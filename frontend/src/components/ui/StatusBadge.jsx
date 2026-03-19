function StatusBadge({ status, className = "" }) {
  const normalized = String(status || "").toLowerCase();

  const styles = {
    open: "bg-green-100 text-green-700",
    full: "bg-red-100 text-red-700",
    booked: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    attended: "bg-green-100 text-green-700",
    confirmed: "bg-amber-100 text-amber-700",
    pending: "bg-amber-100 text-amber-700",
    missed: "bg-orange-100 text-orange-700",
    default: "bg-app-surface-2 text-app-text-soft",
  };

  const labelMap = {
    open: "Open",
    full: "Full",
    booked: "Booked",
    cancelled: "Cancelled",
    attended: "Attended",
    confirmed: "Confirmed",
    pending: "Pending",
    missed: "Missed",
  };

  const badgeClass = styles[normalized] || styles.default;
  const label = labelMap[normalized] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClass} ${className}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
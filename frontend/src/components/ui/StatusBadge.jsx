function StatusBadge({ status, className = "" }) {
    const normalized = String(status || "").toLowerCase();

    const styles = {
        open: "bg-emerald-500/10 text-emerald-300",
        full: "bg-red-500/10 text-red-300",
        booked: "bg-blue-500/10 text-blue-300",
        cancelled: "bg-red-500/10 text-red-300",
        attended: "bg-emerald-500/10 text-emerald-300",
        confirmed: "bg-yellow-400/10 text-yellow-300",
        pending: "bg-yellow-400/10 text-yellow-300",
        missed: "bg-orange-500/10 text-orange-300",
        default: "bg-neutral-700/40 text-neutral-200",
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
            className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass} ${className}`}
        >
            {label}
        </span>
    );
}

export default StatusBadge;
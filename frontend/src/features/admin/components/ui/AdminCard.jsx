function AdminCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-app-border bg-app-card shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </div>
  );
}

export default AdminCard;
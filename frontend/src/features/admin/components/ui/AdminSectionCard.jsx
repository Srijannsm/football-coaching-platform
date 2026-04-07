import AdminCard from "./AdminCard";

function AdminSectionCard({
  title,
  description,
  actions,
  children,
  className = "",
  contentClassName = "",
}) {
  return (
    <AdminCard className={`overflow-hidden ${className}`}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 border-b border-app-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-base font-semibold text-app-text">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-sm text-app-text-muted">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      )}

      <div className={`p-5 sm:p-6 ${contentClassName}`}>{children}</div>
    </AdminCard>
  );
}

export default AdminSectionCard;

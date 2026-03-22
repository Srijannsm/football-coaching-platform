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
        <AdminCard className={className}>
            {(title || description || actions) && (
                <div className="flex items-start justify-between gap-4 border-b border-app-border px-5 py-4">
                    <div className="min-w-0">
                        {title ? (
                            <h3 className="text-base font-semibold text-app-text">{title}</h3>
                        ) : null}

                        {description ? (
                            <p className="mt-1 text-sm text-app-text-muted">{description}</p>
                        ) : null}
                    </div>

                    {actions ? (
                        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
                    ) : null}
                </div>
            )}

            <div className={`p-5 ${contentClassName}`}>{children}</div>
        </AdminCard>
    );
}

export default AdminSectionCard;
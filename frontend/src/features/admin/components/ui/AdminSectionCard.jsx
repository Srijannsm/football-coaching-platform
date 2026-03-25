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
        <AdminCard
            className={`h-auto overflow-hidden border-app-border/90 transition-shadow duration-300 hover:shadow-[var(--shadow-soft)] ${className}`}
        >
            {(title || description || actions) && (
                <div className="relative border-b border-app-border bg-app-surface/60 px-5 py-4 sm:px-6">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-brand-primary/30 via-brand-primary/10 to-transparent" />

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            {title ? (
                                <div className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-primary" />
                                    <h3 className="text-base font-bold tracking-tight text-app-text sm:text-lg">
                                        {title}
                                    </h3>
                                </div>
                            ) : null}

                            {description ? (
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-app-text-muted">
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
                </div>
            )}

            <div className={`p-5 sm:p-6 ${contentClassName}`}>{children}</div>
        </AdminCard>
    );
}

export default AdminSectionCard;
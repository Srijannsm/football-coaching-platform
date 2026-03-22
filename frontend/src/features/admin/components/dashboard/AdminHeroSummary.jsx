function AdminHeroSummary({
    title,
    description,
    actions,
    badge = "Academy operations summary",
}) {
    return (
        <div className="overflow-hidden rounded-3xl border border-app-border bg-gradient-to-r from-brand-primary-soft via-app-card to-sky-500/10 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-6 px-6 py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-primary-soft px-4 py-1.5 text-sm font-medium text-brand-primary">
                        ✨ {badge}
                    </div>

                    <h2 className="mt-5 text-3xl font-semibold tracking-tight text-app-text">
                        {title}
                    </h2>

                    <p className="mt-3 max-w-2xl text-base leading-7 text-app-text-muted">
                        {description}
                    </p>
                </div>

                {actions ? (
                    <div className="flex shrink-0 flex-wrap gap-3">
                        {actions}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default AdminHeroSummary;
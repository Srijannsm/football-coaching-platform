function EmptyState({
    title,
    description,
    action,
    className = "",
}) {
    return (
        <div
            className={`rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur ${className}`}
        >
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {description && (
                <p className="mt-3 text-neutral-400">{description}</p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export default EmptyState;
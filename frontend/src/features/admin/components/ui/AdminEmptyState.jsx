function AdminEmptyState({
  title = "No data found",
  description = "There is nothing to show yet.",
  action,
}) {
  return (
    <div className="rounded-3xl border border-dashed border-app-border bg-app-surface-2/60 px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-app-text">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-app-text-muted">
        {description}
      </p>

      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export default AdminEmptyState;
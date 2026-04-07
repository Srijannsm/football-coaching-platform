function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-app-text sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-app-text-muted">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export default AdminPageHeader;

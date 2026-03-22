function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-app-text">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 text-sm text-app-text-muted">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export default AdminPageHeader;
function AdminTableToolbar({ searchValue, onSearchChange, searchPlaceholder = "Search...", filters, actions }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-yellow-300"
        />
        {filters ? <div className="flex flex-wrap gap-3">{filters}</div> : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export default AdminTableToolbar;

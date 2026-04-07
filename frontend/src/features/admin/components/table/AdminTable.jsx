import AdminEmptyState from "../ui/AdminEmptyState";
import AdminSkeleton from "../ui/AdminSkeleton";

function AdminTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = "No data found",
  emptyDescription = "There is nothing to display right now.",
  renderRow,
  className = "",
  tableClassName = "",
  /** Column keys that should be hidden on screens narrower than `lg` */
  hiddenColumnsAtMobile = [],
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <AdminSkeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="p-6">
        <AdminEmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  function isMobileHidden(key) {
    return hiddenColumnsAtMobile.includes(key);
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        {hiddenColumnsAtMobile.length > 0 && (
          <p className="mb-2 px-5 text-xs text-app-text-muted lg:hidden">
            Some columns are hidden — scroll horizontally to see more, or switch to landscape mode.
          </p>
        )}
        <table className={`min-w-full text-left text-sm ${tableClassName}`}>
          <thead className="bg-app-surface-2">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-app-text-muted ${
                    isMobileHidden(column.key) ? "hidden lg:table-cell" : ""
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {data.map((item, index) => renderRow(item, index, { isMobileHidden }))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTable;

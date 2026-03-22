import AdminEmptyState from "../ui/AdminEmptyState";

function AdminTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = "No data found",
  emptyDescription = "There is nothing to display right now.",
  renderRow,
  className = "",
  tableClassName = "",
}) {
  if (isLoading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className={`min-w-full text-left text-sm ${tableClassName}`}>
          <thead className="border-b border-app-border text-app-text-muted">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-3 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b border-app-border">
                <td
                  colSpan={columns.length}
                  className="px-3 py-4 text-sm text-app-text-muted"
                >
                  Loading...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <AdminEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={`min-w-full text-left text-sm ${tableClassName}`}>
        <thead className="border-b border-app-border text-app-text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-3 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{data.map((item, index) => renderRow(item, index))}</tbody>
      </table>
    </div>
  );
}

export default AdminTable;
import { ChevronLeft, ChevronRight } from "lucide-react";

function AdminPagination({ page = 1, count = 0, pageSize = 10, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  if (count <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, count);

  return (
    <div className="flex items-center justify-between gap-4 border-t border-app-border px-5 py-4 sm:px-6">
      <p className="text-sm text-app-text-muted">
        Showing <span className="font-medium text-app-text">{start}–{end}</span> of{" "}
        <span className="font-medium text-app-text">{count}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-card text-app-text-muted transition hover:bg-app-surface-2 hover:text-app-text disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={15} />
        </button>

        <span className="px-3 text-sm font-medium text-app-text">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-card text-app-text-muted transition hover:bg-app-surface-2 hover:text-app-text disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default AdminPagination;

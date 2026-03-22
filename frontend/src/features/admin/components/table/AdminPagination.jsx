function AdminPagination({ page = 1, count = 0, pageSize = 10, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  if (count <= pageSize) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
      <p className="text-sm text-slate-400">
        Page {page} of {totalPages}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminPagination;

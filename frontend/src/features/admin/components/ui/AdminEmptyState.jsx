import { Inbox } from "lucide-react";

function AdminEmptyState({
  title = "No data found",
  description = "There is nothing to show yet.",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-app-border bg-app-surface-2/50 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-app-surface-2 text-app-text-muted">
        <Inbox size={22} />
      </div>
      <h3 className="text-sm font-semibold text-app-text">{title}</h3>
      <p className="mx-auto mt-1 max-w-xs text-sm text-app-text-muted">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export default AdminEmptyState;

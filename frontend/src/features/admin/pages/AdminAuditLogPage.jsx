import { useEffect, useState } from "react";
import Alert from "../../../components/ui/Alert";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminPagination from "../components/table/AdminPagination";
import { useAdminTable } from "../hooks/useAdminTable";
import { getAdminAuditLog } from "../services/adminAuditLogService";

// ─── Action config ────────────────────────────────────────────────────────────

const ACTION_CONFIG = {
  create: {
    label: "Created",
    badgeCls:
      "bg-app-success-bg text-app-success-text border border-app-success-border",
    dotCls: "bg-app-success-text",
  },
  update: {
    label: "Updated",
    badgeCls:
      "bg-app-warning-bg text-app-warning-text border border-app-warning-border",
    dotCls: "bg-app-warning-text",
  },
  delete: {
    label: "Deleted",
    badgeCls:
      "bg-app-danger-bg text-app-danger-text border border-app-danger-border",
    dotCls: "bg-app-danger-text",
  },
};

const ACTION_FILTER_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "create", label: "Created" },
  { value: "update", label: "Updated" },
  { value: "delete", label: "Deleted" },
];

const MODULE_LABELS = {
  User: "User Account",
  TrainingProgram: "Training Program",
  TrainingSession: "Training Session",
  Booking: "Booking",
  Enquiry: "Enquiry",
  GalleryCategory: "Gallery Category",
  GalleryItem: "Gallery Item",
};

const MODEL_FILTER_OPTIONS = [
  { value: "", label: "All sections" },
  ...Object.entries(MODULE_LABELS).map(([value, label]) => ({ value, label })),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(dateString) {
  if (!dateString) return { date: "—", time: "" };
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return { date: dateString, time: "" };
  return {
    date: d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

function humanFieldName(fieldName) {
  return fieldName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(val) {
  if (val === null || val === undefined || val === "") return "(none)";
  if (val === true || val === "True") return "Yes";
  if (val === false || val === "False") return "No";
  return String(val);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionBadge({ action }) {
  const cfg = ACTION_CONFIG[action] || {
    label: action,
    badgeCls: "bg-app-neutral-bg text-app-neutral-text border border-app-neutral-border",
    dotCls: "bg-app-neutral-text",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${cfg.badgeCls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotCls}`} />
      {cfg.label}
    </span>
  );
}

function ActorCell({ userName }) {
  if (!userName || userName === "System") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm italic text-app-text-muted">
        <span className="inline-block h-6 w-6 rounded-full bg-app-surface-2 text-center text-xs leading-6 text-app-text-muted">
          S
        </span>
        System
      </span>
    );
  }
  const initial = userName.charAt(0).toUpperCase();
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-app-text">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-semibold text-brand-primary">
        {initial}
      </span>
      {userName}
    </span>
  );
}

function ChangesDetail({ changes, action }) {
  if (!changes || action === "create") return null;

  const entries = Object.entries(changes).filter(
    ([, val]) => val && typeof val === "object" && "old" in val && "new" in val
  );

  if (entries.length === 0) return null;

  return (
    <div className="mt-2 space-y-1 rounded-md border border-app-border bg-app-surface-2/50 px-3 py-2">
      {entries.map(([field, val]) => (
        <div key={field} className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
          <span className="font-medium text-app-text">{humanFieldName(field)}:</span>
          <span className="text-app-text-muted line-through">
            {formatValue(val.old)}
          </span>
          <span className="text-app-text-muted">→</span>
          <span className="font-medium text-app-text">{formatValue(val.new)}</span>
        </div>
      ))}
    </div>
  );
}

function AuditRow({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const { date, time } = formatTimestamp(entry.timestamp);
  const moduleLabel = MODULE_LABELS[entry.model_name] || entry.model_name;
  const hasChanges =
    entry.action === "update" &&
    entry.changes &&
    Object.values(entry.changes).some(
      (v) => v && typeof v === "object" && "old" in v
    );

  return (
    <tr className="group text-app-text transition-colors hover:bg-app-surface-2/50">
      {/* Date + Time */}
      <td className="whitespace-nowrap px-5 py-3.5 align-top">
        <div className="text-sm text-app-text">{date}</div>
        <div className="text-xs text-app-text-muted">{time}</div>
      </td>

      {/* Who */}
      <td className="hidden px-5 py-3.5 align-top lg:table-cell">
        <ActorCell userName={entry.user_name} />
      </td>

      {/* Action */}
      <td className="whitespace-nowrap px-5 py-3.5 align-top">
        <ActionBadge action={entry.action} />
      </td>

      {/* Section */}
      <td className="whitespace-nowrap px-5 py-3.5 align-top">
        <div className="flex flex-col gap-1">
          <span className="rounded bg-app-surface-2 px-1.5 py-0.5 text-xs font-medium text-app-text-muted">
            {moduleLabel}
          </span>
          {entry.object_id === "bulk" && (
            <span className="rounded bg-app-surface-2 px-1.5 py-0.5 text-xs text-app-text-muted">
              Bulk action
            </span>
          )}
        </div>
      </td>

      {/* What happened */}
      <td className="px-5 py-3.5 align-top">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-app-text">
              {entry.summary || "No details recorded."}
            </p>
            {hasChanges && expanded && (
              <ChangesDetail changes={entry.changes} action={entry.action} />
            )}
          </div>
          {hasChanges && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs text-app-text-muted transition hover:bg-app-surface-2 hover:text-app-text"
              title={expanded ? "Hide changes" : "Show what changed"}
            >
              {expanded ? "Hide" : "Details"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function normalizeResponse(response) {
  if (Array.isArray(response)) return { results: response, count: response.length };
  return { results: response?.results || [], count: response?.count || 0 };
}

function AdminAuditLogPage() {
  const table = useAdminTable({ initialFilters: { action: "", model_name: "" } });

  const [entries, setEntries] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  async function loadAuditLog() {
    try {
      setIsLoading(true);
      setPageError("");
      const response = await getAdminAuditLog(table.queryState);
      const normalized = normalizeResponse(response);
      setEntries(normalized.results);
      setCount(normalized.count);
    } catch (err) {
      setPageError(err?.response?.data?.detail || "Failed to load audit log.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAuditLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    table.queryState.page,
    table.queryState.page_size,
    table.queryState.action,
    table.queryState.model_name,
  ]);

  const selectCls =
    "h-9 rounded-lg border border-app-border bg-app-card px-3 text-sm text-app-text outline-none transition focus:border-brand-primary";

  return (
    <div className="space-y-6">
      {pageError ? <Alert variant="error">{pageError}</Alert> : null}

      <AdminSectionCard
        title="Audit Log"
        description="A record of all admin actions taken across the platform."
        contentClassName="p-0"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={table.filters.action}
              onChange={(e) => table.updateFilter("action", e.target.value)}
              className={selectCls}
            >
              {ACTION_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={table.filters.model_name}
              onChange={(e) => table.updateFilter("model_name", e.target.value)}
              className={selectCls}
            >
              {MODEL_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <span className="rounded-lg border border-app-border bg-app-surface-2 px-3 py-1.5 text-sm font-medium text-app-text-muted">
              {isLoading ? "Loading…" : `${count} ${count === 1 ? "entry" : "entries"}`}
            </span>
          </div>
        }
      >

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-app-text-muted">
            Loading audit log…
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-16">
            <p className="text-sm font-medium text-app-text">No entries found</p>
            <p className="text-xs text-app-text-muted">
              Admin actions will appear here as they happen.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-app-border">
                  {["When", "Who", "Action", "Section", "What happened"].map((col) => (
                    <th
                      key={col}
                      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-app-text-muted ${
                        col === "Who" ? "hidden lg:table-cell" : ""
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {entries.map((entry) => (
                  <AuditRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && count > 0 && (
          <div className="border-t border-app-border px-5 py-4">
            <AdminPagination
              page={table.page}
              count={count}
              pageSize={table.pageSize}
              onPageChange={table.setPage}
            />
          </div>
        )}
      </AdminSectionCard>
    </div>
  );
}

export default AdminAuditLogPage;

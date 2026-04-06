import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import { formatDate } from "../../../utils/formatDate";
import { formatTime } from "../../../utils/formatTime";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import AdminToolbar from "../components/ui/AdminToolbar";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminTable from "../components/table/AdminTable";
import AdminPagination from "../components/table/AdminPagination";
import AdminRowActions from "../components/table/AdminRowActions";
import AdminStatusBadge from "../components/ui/AdminStatusBadge";
import AdminFormAlert from "../components/form/AdminFormAlert";
import AdminInputField from "../components/form/AdminInputField";
import AdminSelectField from "../components/form/AdminSelectField";
import AdminTextareaField from "../components/form/AdminTextareaField";
import AdminCheckboxField from "../components/form/AdminCheckboxField";
import AdminConfirmDialog from "../components/ui/AdminConfirmDialog";
import AdminModal from "../components/ui/AdminModal";
import BulkActionBar from "../components/ui/BulkActionBar";
import { useAdminTable } from "../hooks/useAdminTable";
import { useRowSelection } from "../hooks/useRowSelection";
import { normalizeApiErrors } from "../utils/normalizeApiErrors";
import {
  getAdminSessions,
  createAdminSession,
  updateAdminSession,
  deleteAdminSession,
  buildSessionFormData,
  getAdminCoaches,
  bulkDeleteAdminSessions,
  bulkUpdateAdminSessionStatus,
} from "../services/adminSessionsService";
import { getAdminPrograms } from "../services/adminProgramsService";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All sessions" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
  { value: "cancelled", label: "Cancelled" },
];

const BULK_STATUS_OPTIONS = [
  { value: "publish", label: "Publish" },
  { value: "unpublish", label: "Unpublish" },
  { value: "cancel", label: "Cancel" },
];

const initialForm = {
  program: "",
  coach: "",
  session_date: "",
  start_time: "",
  end_time: "",
  location: "",
  max_players: 1,
  price: "",
  is_published: true,
  is_cancelled: false,
  notes: "",
  hero_image: null,
};

const initialFormErrors = {
  fields: {},
  nonField: "",
};

function normalizeResponse(response) {
  if (Array.isArray(response)) {
    return { results: response, count: response.length };
  }
  return {
    results: response?.results || [],
    count: response?.count || 0,
  };
}

function formatProgramTypeLabel(sessionType) {
  return sessionType === "one_to_one" ? "One to One" : "Group";
}

function AdminSessionsPage() {
  const location = useLocation();
  const table = useAdminTable({ initialFilters: { status: "" } });

  const [sessions, setSessions] = useState([]);
  const [count, setCount] = useState(0);
  const [programs, setPrograms] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [editingSessionId, setEditingSessionId] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [bulkDeletePending, setBulkDeletePending] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [pageError, setPageError] = useState("");
  const [highlightedSessionId, setHighlightedSessionId] = useState(null);

  const rowRefs = useRef({});

  const {
    selectedIds,
    allPageSelected,
    somePageSelected,
    toggleSelectAll,
    toggleSelectRow,
    clearSelection,
  } = useRowSelection(sessions);

  const selectedProgram = useMemo(
    () => programs.find((item) => String(item.id) === String(form.program)),
    [programs, form.program]
  );

  const isOneToOneProgram = selectedProgram?.session_type === "one_to_one";
  const isEditing = Boolean(editingSessionId);

  async function loadInitialData() {
    try {
      setIsLoading(true);
      setPageError("");

      const [sessionResponse, programResponse, coachResponse] = await Promise.all([
        getAdminSessions(table.queryState),
        getAdminPrograms({ status: "active" }),
        getAdminCoaches(),
      ]);

      const normalized = normalizeResponse(sessionResponse);
      setSessions(normalized.results);
      setCount(normalized.count);
      setPrograms(
        Array.isArray(programResponse) ? programResponse : programResponse?.results || []
      );
      setCoaches(
        Array.isArray(coachResponse) ? coachResponse : coachResponse?.results || []
      );
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to load sessions data."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    table.queryState.page,
    table.queryState.page_size,
    table.queryState.search,
    table.queryState.status,
  ]);

  useEffect(() => {
    const highlightSessionId = location.state?.highlightSessionId;
    if (!highlightSessionId || !sessions.length) return;

    const matchedSession = sessions.find(
      (session) => String(session.id) === String(highlightSessionId)
    );
    if (!matchedSession) return;

    setHighlightedSessionId(matchedSession.id);

    const rowElement = rowRefs.current[matchedSession.id];
    if (rowElement) {
      rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const timeout = setTimeout(() => setHighlightedSessionId(null), 3000);
    return () => clearTimeout(timeout);
  }, [location.state, sessions]);

  function resetForm() {
    setEditingSessionId(null);
    setForm(initialForm);
    setFormErrors(initialFormErrors);
  }

  function closeFormModal() {
    if (isSaving) return;
    setIsFormModalOpen(false);
    resetForm();
  }

  function openCreateModal() {
    resetForm();
    setIsFormModalOpen(true);
  }

  function openEditModal(session) {
    setEditingSessionId(session.id);
    setFormErrors(initialFormErrors);
    setForm({
      program: session.program ? String(session.program) : "",
      coach: session.coach ? String(session.coach) : "",
      session_date: session.session_date || "",
      start_time: session.start_time || "",
      end_time: session.end_time || "",
      location: session.location || "",
      max_players: session.max_players ?? 1,
      price: session.price || "",
      is_published: Boolean(session.is_published),
      is_cancelled: Boolean(session.is_cancelled),
      notes: session.notes || "",
      hero_image: null,
    });
    setIsFormModalOpen(true);
  }

  function handleInputChange(event) {
    const { name, value, type, checked, files } = event.target;

    setForm((prev) => {
      const nextValue =
        type === "checkbox" ? checked : type === "file" ? files?.[0] || null : value;

      const nextForm = { ...prev, [name]: nextValue };

      if (name === "program") {
        const nextProgram = programs.find(
          (program) => String(program.id) === String(value)
        );
        if (nextProgram?.session_type === "one_to_one") {
          nextForm.max_players = 1;
        }
      }

      if (name === "max_players" && isOneToOneProgram) {
        nextForm.max_players = 1;
      }

      return nextForm;
    });

    setFormErrors((prev) => ({
      ...prev,
      nonField: "",
      fields: { ...prev.fields, [name]: "" },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setIsSaving(true);
      setFormErrors(initialFormErrors);

      const payload = buildSessionFormData({
        ...form,
        max_players: isOneToOneProgram ? 1 : form.max_players,
      });

      if (editingSessionId) {
        await updateAdminSession(editingSessionId, payload);
      } else {
        await createAdminSession(payload);
      }

      closeFormModal();
      await loadInitialData();
    } catch (err) {
      setFormErrors(normalizeApiErrors(err));
    } finally {
      setIsSaving(false);
    }
  }

  // ── Single delete ─────────────────────────────────────────────────────────

  async function handleDeleteConfirm() {
    if (!sessionToDelete) return;
    try {
      setIsDeleting(true);
      await deleteAdminSession(sessionToDelete.id);
      if (editingSessionId === sessionToDelete.id) closeFormModal();
      setSessionToDelete(null);
      await loadInitialData();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to delete session."));
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────

  async function handleBulkStatusApply(action) {
    if (selectedIds.size === 0) return;
    try {
      setIsBulkUpdating(true);
      await bulkUpdateAdminSessionStatus(Array.from(selectedIds), action);
      clearSelection();
      await loadInitialData();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to update sessions."));
    } finally {
      setIsBulkUpdating(false);
    }
  }

  async function handleBulkDeleteConfirm() {
    setBulkDeletePending(false);
    try {
      setIsBulkUpdating(true);
      await bulkDeleteAdminSessions(Array.from(selectedIds));
      clearSelection();
      await loadInitialData();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to delete sessions."));
    } finally {
      setIsBulkUpdating(false);
    }
  }

  const sessionCountLabel = useMemo(() => {
    if (isLoading) return "Loading sessions...";
    return `${count} session${count === 1 ? "" : "s"}`;
  }, [isLoading, count]);

  const modalFooter = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Button type="button" variant="outline" onClick={closeFormModal} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="session-form"
        loading={isSaving}
        loadingText={isEditing ? "Updating..." : "Creating..."}
      >
        {isEditing ? "Update Session" : "Create Session"}
      </Button>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {pageError ? <Alert variant="error">{pageError}</Alert> : null}

        <AdminSectionCard
          title="Session List"
          description="Review upcoming and past training sessions."
          contentClassName="p-0"
          actions={
            <AdminToolbar
              left={
                <div className="ml-auto flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-2.5 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/12 text-brand-primary">
                      <span className="text-sm font-semibold">#</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                        Total sessions
                      </p>
                      <p className="text-sm font-semibold text-app-text">
                        {sessionCountLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-3 py-2 shadow-sm">
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                      Status
                    </span>
                    <select
                      value={table.filters.status}
                      onChange={(event) =>
                        table.updateFilter("status", event.target.value)
                      }
                      className="h-10 rounded-xl border border-app-border bg-app-card px-3 text-sm font-medium text-app-text outline-none transition focus:border-brand-primary"
                    >
                      {STATUS_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button onClick={openCreateModal}>Add New Session</Button>
                  </div>
                </div>
              }
            />
          }
        >
          <AdminTable
            bulkBar={
              selectedIds.size > 0 ? (
                <BulkActionBar
                  selectedCount={selectedIds.size}
                  statusOptions={BULK_STATUS_OPTIONS}
                  onApplyStatus={handleBulkStatusApply}
                  onDelete={() => setBulkDeletePending(true)}
                  onClear={clearSelection}
                  isLoading={isBulkUpdating}
                />
              ) : null
            }
            columns={[
              {
                key: "select",
                label: (
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = somePageSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-app-border accent-brand-primary"
                  />
                ),
              },
              { key: "program", label: "Program" },
              { key: "schedule", label: "Schedule" },
              { key: "coach", label: "Coach" },
              { key: "status", label: "Status" },
              { key: "actions", label: "Actions" },
            ]}
            data={sessions}
            isLoading={isLoading}
            emptyTitle="No sessions found"
            emptyDescription="Create your first session to start scheduling training."
            className="pb-5"
            renderRow={(session) => {
              const isHighlighted = String(highlightedSessionId) === String(session.id);
              const isSelected = selectedIds.has(session.id);

              return (
                <tr
                  key={session.id}
                  ref={(el) => { rowRefs.current[session.id] = el; }}
                  className={`border-b border-app-border text-app-text transition-all duration-300 hover:bg-app-surface-2/40 ${
                    isSelected ? "bg-brand-primary/5" : ""
                  } ${isHighlighted ? "flash-highlight ring-brand-primary" : ""}`}
                >
                  <td className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(session.id)}
                      className="h-4 w-4 cursor-pointer rounded border-app-border accent-brand-primary"
                    />
                  </td>

                  <td className="px-3 py-3">
                    <p className="font-medium text-app-text">{session.program_title}</p>
                    <p className="text-xs text-app-text-muted">{session.location}</p>
                  </td>

                  <td className="px-3 py-3 text-app-text-muted">
                    {formatDate(session.session_date)} • {formatTime(session.start_time)}
                    {session.end_time ? ` - ${formatTime(session.end_time)}` : ""}
                  </td>

                  <td className="px-3 py-3">{session.coach_name}</td>

                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <AdminStatusBadge
                        label={session.is_published ? "Published" : "Draft"}
                      />
                      <AdminStatusBadge
                        label={session.is_cancelled ? "Cancelled" : "Active"}
                      />
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <AdminRowActions>
                      <Button size="sm" onClick={() => openEditModal(session)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger-outline"
                        onClick={() => setSessionToDelete(session)}
                      >
                        Delete
                      </Button>
                    </AdminRowActions>
                  </td>
                </tr>
              );
            }}
          />

          <div className="px-5 pb-5">
            <AdminPagination
              page={table.page}
              count={count}
              pageSize={table.pageSize}
              onPageChange={table.setPage}
            />
          </div>
        </AdminSectionCard>
      </div>

      <AdminModal
        open={isFormModalOpen}
        onClose={closeFormModal}
        size="xl"
        title={isEditing ? "Edit Session" : "Create Session"}
        description={
          isEditing
            ? "Update session schedule, coach assignment, capacity, publishing, and pricing."
            : "Create a new training session with schedule, coach assignment, pricing, and publishing settings."
        }
        footer={modalFooter}
      >
        <form id="session-form" onSubmit={handleSubmit} className="space-y-6">
          <AdminFormAlert message={formErrors.nonField} />

          <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-app-text">Session Setup</h3>
              <p className="mt-1 text-xs text-app-text-muted">
                Choose the program and assign the coach responsible for this session.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminSelectField
                label="Program"
                name="program"
                value={form.program}
                onChange={handleInputChange}
                options={programs.map((program) => ({
                  value: program.id,
                  label: `${program.title} (${formatProgramTypeLabel(program.session_type)})`,
                }))}
                error={formErrors.fields.program}
              />
              <AdminSelectField
                label="Coach"
                name="coach"
                value={form.coach}
                onChange={handleInputChange}
                options={coaches.map((coach) => ({
                  value: coach.user_id,
                  label: coach.full_name || coach.username,
                }))}
                error={formErrors.fields.coach}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-app-text">Schedule & Venue</h3>
              <p className="mt-1 text-xs text-app-text-muted">
                Set the date, time window, and location for this training session.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminInputField
                label="Session Date"
                name="session_date"
                type="date"
                value={form.session_date}
                onChange={handleInputChange}
                error={formErrors.fields.session_date}
              />
              <AdminInputField
                label="Location"
                name="location"
                value={form.location}
                onChange={handleInputChange}
                error={formErrors.fields.location}
              />
              <AdminInputField
                label="Start Time"
                name="start_time"
                type="time"
                value={form.start_time}
                onChange={handleInputChange}
                error={formErrors.fields.start_time}
              />
              <AdminInputField
                label="End Time"
                name="end_time"
                type="time"
                value={form.end_time}
                onChange={handleInputChange}
                error={formErrors.fields.end_time}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-app-text">Capacity & Pricing</h3>
              <p className="mt-1 text-xs text-app-text-muted">
                Control player capacity and define the session price.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <AdminInputField
                  label="Max Players"
                  name="max_players"
                  type="number"
                  min="1"
                  value={form.max_players}
                  onChange={handleInputChange}
                  disabled={isOneToOneProgram}
                  error={formErrors.fields.max_players}
                />
                {isOneToOneProgram && (
                  <p className="mt-2 text-xs text-app-text-muted">
                    One-to-one sessions are limited to 1 player.
                  </p>
                )}
              </div>
              <AdminInputField
                label="Price"
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleInputChange}
                error={formErrors.fields.price}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-app-text">Publishing & Notes</h3>
              <p className="mt-1 text-xs text-app-text-muted">
                Add internal notes and control whether this session is visible or cancelled.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <AdminTextareaField
                  label="Notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  error={formErrors.fields.notes}
                />
              </div>
              <AdminCheckboxField
                label="Published"
                name="is_published"
                checked={form.is_published}
                onChange={handleInputChange}
                error={formErrors.fields.is_published}
              />
              <AdminCheckboxField
                label="Cancelled"
                name="is_cancelled"
                checked={form.is_cancelled}
                onChange={handleInputChange}
                error={formErrors.fields.is_cancelled}
              />
            </div>
          </section>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={bulkDeletePending}
        title={`Delete ${selectedIds.size} Session${selectedIds.size === 1 ? "" : "s"}`}
        description={`This action cannot be undone. ${selectedIds.size} session${selectedIds.size === 1 ? "" : "s"} will be permanently removed.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setBulkDeletePending(false)}
        isLoading={isBulkUpdating}
      />

      <AdminConfirmDialog
        open={Boolean(sessionToDelete)}
        title="Delete Session"
        description={
          sessionToDelete
            ? `This action cannot be undone. The session on ${formatDate(sessionToDelete.session_date)} will be permanently removed.`
            : ""
        }
        confirmLabel="Delete Session"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSessionToDelete(null)}
        isLoading={isDeleting}
      />
    </>
  );
}

export default AdminSessionsPage;

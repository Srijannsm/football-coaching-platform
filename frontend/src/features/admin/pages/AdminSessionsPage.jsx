import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import { formatDate } from "../../../utils/formatDate";
import { formatTime } from "../../../utils/formatTime";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import AdminPageHeader from "../components/layout/AdminPageHeader";
import AdminToolbar from "../components/ui/AdminToolbar";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminTable from "../components/table/AdminTable";
import AdminRowActions from "../components/table/AdminRowActions";
import AdminStatusBadge from "../components/ui/AdminStatusBadge";
import AdminFormAlert from "../components/form/AdminFormAlert";
import AdminInputField from "../components/form/AdminInputField";
import AdminSelectField from "../components/form/AdminSelectField";
import AdminTextareaField from "../components/form/AdminTextareaField";
import AdminCheckboxField from "../components/form/AdminCheckboxField";
import AdminConfirmDialog from "../components/ui/AdminConfirmDialog";
import AdminModal from "../components/ui/AdminModal";
import { normalizeApiErrors } from "../utils/normalizeApiErrors";
import {
  getAdminSessions,
  createAdminSession,
  updateAdminSession,
  deleteAdminSession,
  buildSessionFormData,
  getAdminCoaches,
} from "../services/adminSessionsService";
import { getAdminPrograms } from "../services/adminProgramsService";

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

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All sessions" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
  { value: "cancelled", label: "Cancelled" },
];

function normalizeList(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatProgramTypeLabel(sessionType) {
  return sessionType === "one_to_one" ? "One to One" : "Group";
}

function AdminSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingSessionId, setEditingSessionId] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [pageError, setPageError] = useState("");

  const selectedProgram = useMemo(
    () => programs.find((item) => String(item.id) === String(form.program)),
    [programs, form.program]
  );

  const isOneToOneProgram = selectedProgram?.session_type === "one_to_one";
  const isEditing = Boolean(editingSessionId);

  async function loadInitialData(filter = statusFilter) {
    try {
      setIsLoading(true);
      setPageError("");

      const [sessionResponse, programResponse, coachResponse] =
        await Promise.all([
          getAdminSessions({ status: filter }),
          getAdminPrograms({ status: "active" }),
          getAdminCoaches(),
        ]);

      setSessions(normalizeList(sessionResponse));
      setPrograms(normalizeList(programResponse));
      setCoaches(normalizeList(coachResponse));
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to load sessions data."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

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
        type === "checkbox"
          ? checked
          : type === "file"
            ? files?.[0] || null
            : value;

      const nextForm = {
        ...prev,
        [name]: nextValue,
      };

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
      fields: {
        ...prev.fields,
        [name]: "",
      },
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
      await loadInitialData(statusFilter);
    } catch (err) {
      setFormErrors(normalizeApiErrors(err));
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleteClick(session) {
    setSessionToDelete(session);
  }

  function handleDeleteCancel() {
    setSessionToDelete(null);
  }

  async function handleDeleteConfirm() {
    if (!sessionToDelete) return;

    try {
      setIsDeleting(true);

      await deleteAdminSession(sessionToDelete.id);

      if (editingSessionId === sessionToDelete.id) {
        closeFormModal();
      }

      setSessionToDelete(null);
      await loadInitialData(statusFilter);
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to delete session."));
    } finally {
      setIsDeleting(false);
    }
  }

  const sessionCountLabel = useMemo(() => {
    if (isLoading) return "Loading sessions...";
    return `${sessions.length} session${sessions.length === 1 ? "" : "s"}`;
  }, [isLoading, sessions.length]);

  const modalFooter = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={closeFormModal}
        disabled={isSaving}
      >
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

        <AdminToolbar
          left={
            <div className="flex items-center gap-3 ml-auto">
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
                  value={statusFilter}
                  onChange={(event) => {
                    const nextFilter = event.target.value;
                    setStatusFilter(nextFilter);
                    loadInitialData(nextFilter);
                  }}
                  className="h-10 rounded-xl border border-app-border bg-app-card px-3 text-sm font-medium text-app-text outline-none transition focus:border-brand-primary"
                >
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          }
        />

        <AdminPageHeader
          actions={
            <div className="flex items-center gap-3">
              {/* <Button variant="outline" onClick={() => loadInitialData()}>
                Refresh
              </Button> */}
              <Button onClick={openCreateModal}>Add New Session</Button>
            </div>
          }
        />

        <AdminSectionCard
          title="Session List"
          description="Review upcoming and past training sessions."
          contentClassName="p-0"
        >
          <AdminTable
            columns={[
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
            className="px-5 pb-5"
            renderRow={(session) => (
              <tr
                key={session.id}
                className="border-b border-app-border text-app-text transition hover:bg-app-surface-2/40"
              >
                <td className="px-3 py-3">
                  <p className="font-medium text-app-text">
                    {session.program_title}
                  </p>
                  <p className="text-xs text-app-text-muted">
                    {session.location}
                  </p>
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
                      onClick={() => handleDeleteClick(session)}
                    >
                      Delete
                    </Button>
                  </AdminRowActions>
                </td>
              </tr>
            )}
          />
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
              <h3 className="text-sm font-semibold text-app-text">
                Session Setup
              </h3>
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
                  value: coach.id,
                  label: coach.full_name || coach.username,
                }))}
                error={formErrors.fields.coach}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-app-text">
                Schedule & Venue
              </h3>
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
              <h3 className="text-sm font-semibold text-app-text">
                Capacity & Pricing
              </h3>
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

                {isOneToOneProgram ? (
                  <p className="mt-2 text-xs text-app-text-muted">
                    One-to-one sessions are limited to 1 player.
                  </p>
                ) : null}
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
              <h3 className="text-sm font-semibold text-app-text">
                Publishing & Notes
              </h3>
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
        open={Boolean(sessionToDelete)}
        title="Delete Session"
        description={
          sessionToDelete
            ? `This action cannot be undone. The session on ${formatDate(
              sessionToDelete.session_date
            )} will be permanently removed.`
            : ""
        }
        confirmLabel="Delete Session"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </>
  );
}

export default AdminSessionsPage;
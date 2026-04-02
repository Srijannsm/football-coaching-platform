import { useEffect, useMemo, useState } from "react";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import { formatDate } from "../../../utils/formatDate";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import AdminToolbar from "../components/ui/AdminToolbar";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminTable from "../components/table/AdminTable";
import AdminPagination from "../components/table/AdminPagination";
import AdminRowActions from "../components/table/AdminRowActions";
import AdminStatusBadge from "../components/ui/AdminStatusBadge";
import AdminFormAlert from "../components/form/AdminFormAlert";
import AdminInputField from "../components/form/AdminInputField";
import AdminCheckboxField from "../components/form/AdminCheckboxField";
import AdminTextareaField from "../components/form/AdminTextareaField";
import AdminConfirmDialog from "../components/ui/AdminConfirmDialog";
import AdminModal from "../components/ui/AdminModal";
import { useAdminTable } from "../hooks/useAdminTable";
import { normalizeApiErrors } from "../utils/normalizeApiErrors";
import {
  buildCoachFormData,
  getAdminCoachDirectory,
  updateAdminCoach,
} from "../services/adminCoachesService";
import { useDebounce } from "../hooks/useDebounce";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  years_experience: "",
  coaching_level: "",
  specialties: "",
  bio: "",
  is_active: true,
  image: null,
  remove_image: false,
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

function getCoachDisplayName(coach) {
  return (
    [coach?.first_name, coach?.last_name].filter(Boolean).join(" ") ||
    coach?.username ||
    "Coach"
  );
}

function getCoachInitials(coach) {
  const name = getCoachDisplayName(coach).trim();
  if (!name) return "C";

  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function AdminCoachesPage() {
  const table = useAdminTable({ initialFilters: { status: "" } });
  const [searchInput, setSearchInput] = useState(table.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [coaches, setCoaches] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [editingCoachId, setEditingCoachId] = useState(null);
  const [editingCoach, setEditingCoach] = useState(null);
  const [coachToToggle, setCoachToToggle] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [pageError, setPageError] = useState("");

  async function loadCoaches() {
    try {
      setIsLoading(true);
      setPageError("");
      const response = await getAdminCoachDirectory(table.queryState);
      const normalized = normalizeResponse(response);
      setCoaches(normalized.results);
      setCount(normalized.count);
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to load coaches."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    table.setSearch(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    loadCoaches();
  }, [
    table.queryState.page,
    table.queryState.page_size,
    table.queryState.search,
    table.queryState.status,
  ]);

  const selectedImagePreviewUrl = useMemo(() => {
    if (!form.image) return null;
    return URL.createObjectURL(form.image);
  }, [form.image]);

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
    };
  }, [selectedImagePreviewUrl]);

  function resetForm() {
    setEditingCoachId(null);
    setEditingCoach(null);
    setForm(initialForm);
    setFormErrors(initialFormErrors);
  }

  function closeEditModal() {
    if (isSaving) return;
    setIsEditModalOpen(false);
    resetForm();
  }

  function openEditModal(coach) {
    setEditingCoachId(coach.id);
    setEditingCoach(coach);
    setFormErrors(initialFormErrors);

    setForm({
      first_name: coach.first_name || "",
      last_name: coach.last_name || "",
      email: coach.email || "",
      phone_number: coach.phone_number || "",
      years_experience: coach.years_experience ?? "",
      coaching_level: coach.coaching_level || "",
      specialties: coach.specialties || "",
      bio: coach.bio || "",
      is_active: Boolean(coach.is_active),
      image: null,
      remove_image: false,
    });

    setIsEditModalOpen(true);
  }

  function handleInputChange(event) {
    const { name, value, type, checked, files } = event.target;

    setForm((prev) => {
      let nextValue;

      if (type === "checkbox") {
        nextValue = checked;
      } else if (type === "file") {
        nextValue = files?.[0] || null;
      } else {
        nextValue = value;
      }

      return {
        ...prev,
        [name]: nextValue,
        ...(type === "file" && nextValue
          ? { remove_image: false }
          : {}),
      };
    });

    setFormErrors((prev) => ({
      ...prev,
      nonField: prev.nonField,
      fields: {
        ...prev.fields,
        [name]: "",
      },
    }));
  }

  function handleRemoveImage() {
    setForm((prev) => ({
      ...prev,
      image: null,
      remove_image: true,
    }));
  }

  function handleKeepCurrentImage() {
    setForm((prev) => ({
      ...prev,
      image: null,
      remove_image: false,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!editingCoachId) return;

    try {
      setIsSaving(true);
      setFormErrors(initialFormErrors);

      const payload = buildCoachFormData({
        ...form,
        years_experience:
          form.years_experience === "" ? null : Number(form.years_experience),
      });

      await updateAdminCoach(editingCoachId, payload);
      closeEditModal();
      await loadCoaches();
    } catch (err) {
      setFormErrors(normalizeApiErrors(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleConfirm() {
    if (!coachToToggle) return;

    try {
      setIsStatusUpdating(true);
      const payload = buildCoachFormData({
        is_active: !coachToToggle.is_active,
      });
      await updateAdminCoach(coachToToggle.id, payload);
      setCoachToToggle(null);
      await loadCoaches();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to update coach status."));
    } finally {
      setIsStatusUpdating(false);
    }
  }

  const currentImageUrl =
    form.remove_image
      ? null
      : selectedImagePreviewUrl || editingCoach?.image_url || null;

  const hasExistingImage = Boolean(editingCoach?.image_url);
  const hasNewSelectedImage = Boolean(form.image);

  return (
    <>
      <div className="space-y-6">
        {pageError ? <Alert variant="error">{pageError}</Alert> : null}


        <AdminSectionCard
          title="Coach Directory"
          description="Manage registered coaches and keep profiles up to date."
          contentClassName="p-0"
          actions={<AdminToolbar
            left={(
              <div className="ml-auto flex items-center gap-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, email, phone or specialties"
                  className="h-10 min-w-[280px] rounded-xl border border-app-border bg-app-card px-4 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary"
                />
                <select
                  value={table.filters.status}
                  onChange={(event) => table.updateFilter("status", event.target.value)}
                  className="h-10 rounded-xl border border-app-border bg-app-card px-3 text-sm font-medium text-app-text outline-none transition focus:border-brand-primary"
                >
                  <option value="">All coaches</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
              </div>
            )}
          />}
        >
          <AdminTable
            columns={[
              { key: "coach", label: "Coach" },
              { key: "specialties", label: "Specialties" },
              { key: "experience", label: "Experience" },
              { key: "status", label: "Status" },
              { key: "joined", label: "Joined" },
              { key: "actions", label: "Actions" },
            ]}
            data={coaches}
            isLoading={isLoading}
            emptyTitle="No coaches found"
            emptyDescription="Try adjusting search or status filter."
            className="pb-5"
            renderRow={(coach) => (
              <tr
                key={coach.id}
                className="border-b border-app-border text-app-text transition hover:bg-app-surface-2/40"
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    {coach.image_url ? (
                      <img
                        src={coach.image_url}
                        alt={getCoachDisplayName(coach)}
                        className="h-11 w-11 rounded-2xl border border-app-border object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-app-border bg-app-surface-2 text-xs font-bold text-app-text">
                        {getCoachInitials(coach)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-medium text-app-text">
                        {getCoachDisplayName(coach)}
                      </p>
                      <p className="truncate text-xs text-app-text-muted">
                        {coach.email || "No email"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <p className="max-w-[280px] truncate">
                    {coach.specialties || "Not set"}
                  </p>
                </td>

                <td className="px-3 py-3">
                  {coach.years_experience
                    ? `${coach.years_experience} yrs`
                    : "Not set"}
                </td>

                <td className="px-3 py-3">
                  <AdminStatusBadge label={coach.is_active ? "Active" : "Inactive"} />
                </td>

                <td className="px-3 py-3 text-app-text-muted">
                  {formatDate(coach.date_joined)}
                </td>

                <td className="px-3 py-3">
                  <AdminRowActions>
                    <Button size="sm" onClick={() => openEditModal(coach)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={coach.is_active ? "danger-outline" : "outline"}
                      onClick={() => setCoachToToggle(coach)}
                    >
                      {coach.is_active ? "Deactivate" : "Reactivate"}
                    </Button>
                  </AdminRowActions>
                </td>
              </tr>
            )}
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
        open={isEditModalOpen}
        onClose={closeEditModal}
        size="lg"
        title="Edit Coach"
        description="Update coach profile details, photo, and account status."
        footer={(
          <div className="flex flex-col-reverse gap-3 border-t border-app-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-app-text-muted">
              Changes are saved directly to this coach profile.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditModal}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="coach-form"
                loading={isSaving}
                loadingText="Updating..."
              >
                Update Coach
              </Button>
            </div>
          </div>
        )}
      >
        <form id="coach-form" onSubmit={handleSubmit} className="space-y-6">
          <AdminFormAlert message={formErrors.nonField} />

          {editingCoach ? (
            <div className="rounded-3xl border border-app-border bg-app-surface-2/70 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={getCoachDisplayName(editingCoach)}
                    className="h-20 w-20 rounded-3xl border border-app-border object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-app-border bg-app-card text-lg font-bold text-app-text">
                    {getCoachInitials(editingCoach)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-text-muted">
                    Editing Profile
                  </p>
                  <h3 className="mt-1 truncate text-lg font-bold text-app-text">
                    {getCoachDisplayName(editingCoach)}
                  </h3>
                  <p className="truncate text-sm text-app-text-muted">
                    {editingCoach.email || "No email provided"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-app-border bg-app-card px-3 py-1 text-xs font-medium text-app-text-soft">
                      Joined {formatDate(editingCoach.date_joined)}
                    </span>
                    <span className="rounded-full border border-app-border bg-app-card px-3 py-1 text-xs font-medium text-app-text-soft">
                      {editingCoach.is_active ? "Currently active" : "Currently inactive"}
                    </span>
                    {hasNewSelectedImage ? (
                      <span className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                        New image selected
                      </span>
                    ) : null}
                    {form.remove_image ? (
                      <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs font-medium text-red-300">
                        Image will be removed
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-6">
            <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-app-text-muted">
                  Basic Information
                </h4>
                <p className="mt-1 text-sm text-app-text-soft">
                  Update coach account details visible across the admin system.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <AdminInputField
                  label="First Name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleInputChange}
                  error={formErrors.fields.first_name}
                />
                <AdminInputField
                  label="Last Name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleInputChange}
                  error={formErrors.fields.last_name}
                />
                <AdminInputField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  error={formErrors.fields.email}
                />
                <AdminInputField
                  label="Phone Number"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleInputChange}
                  error={formErrors.fields.phone_number}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-app-text-muted">
                  Coaching Profile
                </h4>
                <p className="mt-1 text-sm text-app-text-soft">
                  Keep professional details complete so the directory stays useful.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <AdminInputField
                  label="Years Experience"
                  name="years_experience"
                  type="number"
                  value={form.years_experience}
                  onChange={handleInputChange}
                  error={formErrors.fields.years_experience}
                />
                <AdminInputField
                  label="Coaching Level"
                  name="coaching_level"
                  value={form.coaching_level}
                  onChange={handleInputChange}
                  error={formErrors.fields.coaching_level}
                />

                <div className="md:col-span-2">
                  <AdminInputField
                    label="Specialties"
                    name="specialties"
                    value={form.specialties}
                    onChange={handleInputChange}
                    error={formErrors.fields.specialties}
                  />
                </div>

                <div className="md:col-span-2">
                  <AdminTextareaField
                    label="Bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleInputChange}
                    error={formErrors.fields.bio}
                    rows={5}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-app-text-muted">
                  Profile Image
                </h4>
                <p className="mt-1 text-sm text-app-text-soft">
                  Upload a new image, keep the current one, or remove it.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[140px_minmax(0,1fr)]">
                <div className="flex items-start justify-center lg:justify-start">
                  {currentImageUrl ? (
                    <img
                      src={currentImageUrl}
                      alt="Coach preview"
                      className="h-28 w-28 rounded-3xl border border-app-border object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-dashed border-app-border bg-app-card text-sm font-medium text-app-text-muted">
                      No Image
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-dashed border-app-border bg-app-card p-4">
                    <label className="block text-sm font-medium text-app-text">
                      Upload New Image
                    </label>
                    <p className="mt-1 text-xs text-app-text-muted">
                      PNG, JPG, or WEBP works best for coach profile photos.
                    </p>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="mt-3 block w-full text-sm text-app-text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:opacity-90"
                    />
                    {formErrors.fields.image ? (
                      <p className="mt-2 text-sm text-red-400">
                        {formErrors.fields.image}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {hasExistingImage || hasNewSelectedImage ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveImage}
                        disabled={isSaving}
                      >
                        Remove Image
                      </Button>
                    ) : null}

                    {form.remove_image && hasExistingImage ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleKeepCurrentImage}
                        disabled={isSaving}
                      >
                        Keep Current Image
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid gap-3">
                    <AdminCheckboxField
                      label="Remove profile image"
                      name="remove_image"
                      checked={form.remove_image}
                      onChange={handleInputChange}
                    />
                    <AdminCheckboxField
                      label="Active"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(coachToToggle)}
        title={coachToToggle?.is_active ? "Deactivate Coach" : "Reactivate Coach"}
        description={
          coachToToggle
            ? `${coachToToggle.is_active ? "Deactivate" : "Reactivate"} ${getCoachDisplayName(coachToToggle)}?`
            : ""
        }
        confirmLabel={coachToToggle?.is_active ? "Deactivate" : "Reactivate"}
        cancelLabel="Cancel"
        onConfirm={handleToggleConfirm}
        onCancel={() => setCoachToToggle(null)}
        isLoading={isStatusUpdating}
      />
    </>
  );
}

export default AdminCoachesPage;
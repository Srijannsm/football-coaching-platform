import { useEffect, useMemo, useState } from "react";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../hooks/useToast";
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
  const { showToast } = useToast();
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
      showToast("Coach profile updated.", "success");
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
      const wasActive = coachToToggle.is_active;
      await updateAdminCoach(coachToToggle.id, payload);
      showToast(wasActive ? "Coach deactivated." : "Coach reactivated.", "success");
      setCoachToToggle(null);
      await loadCoaches();
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to update coach status."), "error");
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
            left={
              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                <div className="relative flex-1 sm:max-w-sm">
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search coaches…"
                    className="h-9 w-full rounded-lg border border-app-border bg-app-card pl-9 pr-3 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={table.filters.status}
                    onChange={(e) => table.updateFilter("status", e.target.value)}
                    className="h-9 rounded-lg border border-app-border bg-app-card px-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
                  >
                    <option value="">All coaches</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <span className="hidden rounded-lg border border-app-border bg-app-surface-2 px-3 py-1.5 text-sm font-medium text-app-text-muted sm:inline">
                    {isLoading ? "…" : `${count} total`}
                  </span>
                </div>
              </div>
            }
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
            hiddenColumnsAtMobile={["specialties", "experience", "joined"]}
            renderRow={(coach, _index, { isMobileHidden }) => (
              <tr
                key={coach.id}
                className="text-app-text transition-colors hover:bg-app-surface-2/50"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {coach.image_url ? (
                      <img
                        src={coach.image_url}
                        alt={getCoachDisplayName(coach)}
                        loading="lazy"
                        decoding="async"
                        className="h-9 w-9 rounded-full border border-app-border object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">
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

                <td className={isMobileHidden("specialties") ? "hidden lg:table-cell px-5 py-3.5" : "px-5 py-3.5"}>
                  <p className="truncate">
                    {coach.specialties || "Not set"}
                  </p>
                </td>

                <td className={isMobileHidden("experience") ? "hidden lg:table-cell px-5 py-3.5" : "px-5 py-3.5"}>
                  {coach.years_experience
                    ? `${coach.years_experience} yrs`
                    : "Not set"}
                </td>

                <td className="px-5 py-3.5">
                  <AdminStatusBadge label={coach.is_active ? "Active" : "Inactive"} />
                </td>

                <td className={isMobileHidden("joined") ? "hidden lg:table-cell px-3 py-3 text-app-text-muted" : "px-3 py-3 text-app-text-muted"}>
                  {formatDate(coach.date_joined)}
                </td>

                <td className="px-5 py-3.5">
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="outline" onClick={closeEditModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" form="coach-form" loading={isSaving} loadingText="Updating...">
              Update Coach
            </Button>
          </div>
        )}
      >
        <form id="coach-form" onSubmit={handleSubmit} className="space-y-6">
          <AdminFormAlert message={formErrors.nonField} />

          {editingCoach ? (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-app-border bg-app-surface-2 p-4">
              {currentImageUrl ? (
                <img src={currentImageUrl} alt={getCoachDisplayName(editingCoach)} loading="lazy" decoding="async" className="h-12 w-12 rounded-full border border-app-border object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">
                  {getCoachInitials(editingCoach)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-app-text">{getCoachDisplayName(editingCoach)}</p>
                <p className="text-sm text-app-text-muted">{editingCoach.email || "No email"}</p>
              </div>
              <div className="ml-auto flex flex-wrap gap-1.5">
                {hasNewSelectedImage && <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">New image</span>}
                {form.remove_image && <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">Image removed</span>}
              </div>
            </div>
          ) : null}

          <div className="grid gap-5">
            <section className="rounded-xl border border-app-border p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-app-text">Basic Information</h4>
                <p className="mt-0.5 text-xs text-app-text-muted">Update coach account details visible across the admin system.</p>
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

            <section className="rounded-xl border border-app-border p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-app-text">Coaching Profile</h4>
                <p className="mt-0.5 text-xs text-app-text-muted">Keep professional details complete so the directory stays useful.</p>
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

            <section className="rounded-xl border border-app-border p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-app-text">Profile Image</h4>
                <p className="mt-0.5 text-xs text-app-text-muted">Upload a new image, keep the current one, or remove it.</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  {currentImageUrl ? (
                    <img src={currentImageUrl} alt="Coach preview" loading="lazy" decoding="async" className="h-20 w-20 rounded-xl border border-app-border object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-app-border bg-app-surface-2 text-xs text-app-text-muted">No Image</div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="rounded-lg border border-dashed border-app-border bg-app-surface-2/60 p-4">
                    <label className="block text-sm font-medium text-app-text">Upload New Image</label>
                    <p className="mt-0.5 text-xs text-app-text-muted">PNG, JPG, or WEBP · Max 1920px</p>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="mt-3 block w-full text-sm text-app-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-primary-hover"
                    />
                    {formErrors.fields.image ? (
                      <p className="mt-1.5 text-xs text-red-500">{formErrors.fields.image}</p>
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
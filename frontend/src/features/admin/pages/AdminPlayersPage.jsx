import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
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
import AdminConfirmDialog from "../components/ui/AdminConfirmDialog";
import AdminModal from "../components/ui/AdminModal";
import { useAdminTable } from "../hooks/useAdminTable";
import { normalizeApiErrors } from "../utils/normalizeApiErrors";
import {
  buildPlayerFormData,
  getAdminPlayers,
  updateAdminPlayer,
} from "../services/adminPlayersService";
import { useDebounce } from "../hooks/useDebounce";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  primary_position: "",
  player_rating: "",
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

function getPlayerDisplayName(player) {
  return (
    [player?.first_name, player?.last_name].filter(Boolean).join(" ") ||
    player?.username ||
    "Player"
  );
}

function getPlayerInitials(player) {
  const name = getPlayerDisplayName(player).trim();
  if (!name) return "P";

  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function AdminPlayersPage() {
  const table = useAdminTable({ initialFilters: { status: "" } });
  const [searchInput, setSearchInput] = useState(table.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [players, setPlayers] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerToToggle, setPlayerToToggle] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [pageError, setPageError] = useState("");

  async function loadPlayers() {
    try {
      setIsLoading(true);
      setPageError("");

      const response = await getAdminPlayers(table.queryState);
      const normalized = normalizeResponse(response);

      setPlayers(normalized.results);
      setCount(normalized.count);
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to load players."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    table.setSearch(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    loadPlayers();
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

  const currentImageUrl = form.remove_image
    ? null
    : selectedImagePreviewUrl || editingPlayer?.image_url || null;

  const hasExistingImage = Boolean(editingPlayer?.image_url);
  const hasNewSelectedImage = Boolean(form.image);

  function resetForm() {
    setEditingPlayerId(null);
    setEditingPlayer(null);
    setForm(initialForm);
    setFormErrors(initialFormErrors);
  }

  function closeEditModal() {
    if (isSaving) return;
    setIsEditModalOpen(false);
    resetForm();
  }

  function openEditModal(player) {
    setEditingPlayerId(player.id);
    setEditingPlayer(player);
    setFormErrors(initialFormErrors);

    setForm({
      first_name: player.first_name || "",
      last_name: player.last_name || "",
      email: player.email || "",
      phone_number: player.phone_number || "",
      primary_position: player.primary_position || "",
      player_rating: player.player_rating ?? "",
      is_active: Boolean(player.is_active),
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
        ...(type === "file" && nextValue ? { remove_image: false } : {}),
      };
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
    if (!editingPlayerId) return;

    try {
      setIsSaving(true);
      setFormErrors(initialFormErrors);

      const payload = buildPlayerFormData({
        ...form,
        player_rating: form.player_rating === "" ? null : Number(form.player_rating),
      });

      await updateAdminPlayer(editingPlayerId, payload);

      closeEditModal();
      await loadPlayers();
    } catch (err) {
      setFormErrors(normalizeApiErrors(err));
    } finally {
      setIsSaving(false);
    }
  }

  function handleToggleClick(player) {
    setPlayerToToggle(player);
  }

  function handleToggleCancel() {
    setPlayerToToggle(null);
  }

  async function handleToggleConfirm() {
    if (!playerToToggle) return;

    try {
      setIsStatusUpdating(true);

      const payload = buildPlayerFormData({
        is_active: !playerToToggle.is_active,
      });

      await updateAdminPlayer(playerToToggle.id, payload);

      if (editingPlayerId === playerToToggle.id) {
        setForm((prev) => ({
          ...prev,
          is_active: !playerToToggle.is_active,
        }));
      }

      setPlayerToToggle(null);
      await loadPlayers();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to update player status."));
    } finally {
      setIsStatusUpdating(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {pageError ? <Alert variant="error">{pageError}</Alert> : null}

        <AdminToolbar
          left={
            <div className="ml-auto flex items-center gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, email, username, phone, or position"
                className="h-10 min-w-[280px] rounded-xl border border-app-border bg-app-card px-4 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary"
              />

              <select
                value={table.filters.status}
                onChange={(event) => table.updateFilter("status", event.target.value)}
                className="h-10 rounded-xl border border-app-border bg-app-card px-3 text-sm font-medium text-app-text outline-none transition focus:border-brand-primary"
              >
                <option value="">All players</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>

              <div className="inline-flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-2.5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/12 text-brand-primary">
                  <span className="text-sm font-semibold">#</span>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                    Players
                  </p>
                  <p className="text-sm font-semibold text-app-text">
                    {isLoading ? "Loading players..." : `${count} player${count === 1 ? "" : "s"}`}
                  </p>
                </div>
              </div>
            </div>
          }
        />

        <AdminSectionCard
          title="Player Directory"
          description="Manage registered academy players and keep player records up to date."
          contentClassName="p-0"
        >
          <AdminTable
            columns={[
              { key: "player", label: "Player" },
              { key: "position", label: "Position" },
              { key: "rating", label: "Rating" },
              { key: "status", label: "Status" },
              { key: "joined", label: "Joined" },
              { key: "actions", label: "Actions" },
            ]}
            data={players}
            isLoading={isLoading}
            emptyTitle="No players found"
            emptyDescription="Try adjusting the search or status filter."
            className="pb-5"
            renderRow={(player) => (
              <tr
                key={player.id}
                className="border-b border-app-border text-app-text transition hover:bg-app-surface-2/40"
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    {player.image_url ? (
                      <img
                        src={player.image_url}
                        alt={getPlayerDisplayName(player)}
                        className="h-11 w-11 rounded-2xl border border-app-border object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-app-border bg-app-surface-2 text-xs font-bold text-app-text">
                        {getPlayerInitials(player)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-medium text-app-text">
                        {getPlayerDisplayName(player)}
                      </p>
                      <p className="truncate text-xs text-app-text-muted">
                        {player.email || "No email"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <div>
                    <p className="text-sm text-app-text">
                      {player.primary_position || "Not set"}
                    </p>
                    <p className="text-xs text-app-text-muted">
                      {player.phone_number || "No phone"}
                    </p>
                  </div>
                </td>

                <td className="px-3 py-3">
                  {player.player_rating || "0.00"}
                </td>

                <td className="px-3 py-3">
                  <AdminStatusBadge label={player.is_active ? "Active" : "Inactive"} />
                </td>

                <td className="px-3 py-3 text-app-text-muted">
                  {formatDate(player.date_joined)}
                </td>

                <td className="px-3 py-3">
                  <AdminRowActions>
                    <Button size="sm" onClick={() => openEditModal(player)}>
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant={player.is_active ? "danger-outline" : "outline"}
                      onClick={() => handleToggleClick(player)}
                    >
                      {player.is_active ? "Deactivate" : "Reactivate"}
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
        title="Edit Player"
        description="Update player profile information, image, contact details, rating, and account status."
        footer={
          <div className="flex flex-col-reverse gap-3 border-t border-app-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-app-text-muted">
              Changes are saved directly to this player account.
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
                form="player-form"
                loading={isSaving}
                loadingText="Updating..."
              >
                Update Player
              </Button>
            </div>
          </div>
        }
      >
        <form id="player-form" onSubmit={handleSubmit} className="space-y-6">
          <AdminFormAlert message={formErrors.nonField} />

          {editingPlayer ? (
            <div className="rounded-3xl border border-app-border bg-app-surface-2/70 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={getPlayerDisplayName(editingPlayer)}
                    className="h-20 w-20 rounded-3xl border border-app-border object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-app-border bg-app-card text-lg font-bold text-app-text">
                    {getPlayerInitials(editingPlayer)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-text-muted">
                    Editing Profile
                  </p>
                  <h3 className="mt-1 truncate text-lg font-bold text-app-text">
                    {getPlayerDisplayName(editingPlayer)}
                  </h3>
                  <p className="truncate text-sm text-app-text-muted">
                    {editingPlayer.email || "No email provided"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-app-border bg-app-card px-3 py-1 text-xs font-medium text-app-text-soft">
                      Joined {formatDate(editingPlayer.date_joined)}
                    </span>

                    <span className="rounded-full border border-app-border bg-app-card px-3 py-1 text-xs font-medium text-app-text-soft">
                      {editingPlayer.is_active ? "Currently active" : "Currently inactive"}
                    </span>

                    {editingPlayer.primary_position ? (
                      <span className="rounded-full border border-app-border bg-app-card px-3 py-1 text-xs font-medium text-app-text-soft">
                        {editingPlayer.primary_position}
                      </span>
                    ) : null}

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
                  Update player account details and contact information.
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
                  Player Profile
                </h4>
                <p className="mt-1 text-sm text-app-text-soft">
                  Manage position, player rating, and account availability.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <AdminInputField
                  label="Primary Position"
                  name="primary_position"
                  value={form.primary_position}
                  onChange={handleInputChange}
                  error={formErrors.fields.primary_position}
                />

                <AdminInputField
                  label="Player Rating"
                  name="player_rating"
                  type="number"
                  step="0.01"
                  value={form.player_rating}
                  onChange={handleInputChange}
                  error={formErrors.fields.player_rating}
                />

                <div className="md:col-span-2">
                  <AdminCheckboxField
                    label="Active"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleInputChange}
                    error={formErrors.fields.is_active}
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
                      alt="Player preview"
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
                      PNG, JPG, or WEBP works best for player profile photos.
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
                    {(hasExistingImage || hasNewSelectedImage) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveImage}
                        disabled={isSaving}
                      >
                        Remove Image
                      </Button>
                    )}

                    {form.remove_image && hasExistingImage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleKeepCurrentImage}
                        disabled={isSaving}
                      >
                        Keep Current Image
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(playerToToggle)}
        title={playerToToggle?.is_active ? "Deactivate Player" : "Reactivate Player"}
        description={
          playerToToggle
            ? `${playerToToggle.is_active ? "Deactivate" : "Reactivate"} ${getPlayerDisplayName(playerToToggle)}?`
            : ""
        }
        confirmLabel={playerToToggle?.is_active ? "Deactivate" : "Reactivate"}
        cancelLabel="Cancel"
        onConfirm={handleToggleConfirm}
        onCancel={handleToggleCancel}
        isLoading={isStatusUpdating}
      />
    </>
  );
}

export default AdminPlayersPage;
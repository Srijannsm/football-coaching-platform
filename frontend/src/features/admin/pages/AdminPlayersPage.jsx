import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import { useToast } from "../../../hooks/useToast";
import { formatDate } from "../../../utils/formatDate";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import AdminToolbar from "../components/ui/AdminToolbar";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminTable from "../components/table/AdminTable";
import AdminPagination from "../components/table/AdminPagination";
import AdminRowActions from "../components/table/AdminRowActions";
import AdminStatusBadge from "../components/ui/AdminStatusBadge";
import AdminPlayerBookingsDetailsView from "../components/ui/AdminPlayerBookingsDetailsView";
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
import {
  getAdminBookings,
} from "../services/adminBookingsService";
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
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState(table.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [players, setPlayers] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerToToggle, setPlayerToToggle] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [selectedPlayerForBookings, setSelectedPlayerForBookings] = useState(null);
  const [selectedPlayerBookings, setSelectedPlayerBookings] = useState([]);


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
      showToast("Player profile updated.", "success");
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

      const wasActive = playerToToggle.is_active;
      await updateAdminPlayer(playerToToggle.id, payload);

      if (editingPlayerId === playerToToggle.id) {
        setForm((prev) => ({
          ...prev,
          is_active: !playerToToggle.is_active,
        }));
      }

      showToast(wasActive ? "Player deactivated." : "Player reactivated.", "success");
      setPlayerToToggle(null);
      await loadPlayers();
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to update player status."), "error");
    } finally {
      setIsStatusUpdating(false);
    }
  }



  async function handleOpenBookingsModal(player) {
    setSelectedPlayerForBookings(player);
    setSelectedPlayerBookings([]);
    setIsBookingsModalOpen(true);
    setIsBookingsLoading(true);

    try {
      const response = await getAdminBookings({ player_id: player.id });
      const bookings = Array.isArray(response) ? response : response?.results || [];
      setSelectedPlayerBookings(bookings);
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to load player bookings."));
    } finally {
      setIsBookingsLoading(false);
    }
  }

  function handleCloseBookingsModal() {
    if (isBookingsLoading) return;
    setIsBookingsModalOpen(false);
    setSelectedPlayerForBookings(null);
    setSelectedPlayerBookings([]);
  }


  return (
    <>
      <div className="space-y-6">
        {pageError ? <Alert variant="error">{pageError}</Alert> : null}


        <AdminSectionCard
          title="Player Directory"
          description="Manage registered academy players and keep records up to date."
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
                    placeholder="Search players…"
                    className="h-9 w-full rounded-lg border border-app-border bg-app-card pl-9 pr-3 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={table.filters.status}
                    onChange={(e) => table.updateFilter("status", e.target.value)}
                    className="h-9 rounded-lg border border-app-border bg-app-card px-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
                  >
                    <option value="">All players</option>
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

          {/* Toolbar */}
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
            hiddenColumnsAtMobile={["position", "rating", "joined"]}
            renderRow={(player, _index, { isMobileHidden }) => (
              <tr
                key={player.id}
                className="text-app-text transition-colors hover:bg-app-surface-2/50"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {player.image_url ? (
                      <img
                        src={player.image_url}
                        alt={getPlayerDisplayName(player)}
                        loading="lazy"
                        decoding="async"
                        className="h-9 w-9 rounded-full border border-app-border object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
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

                <td className={isMobileHidden("position") ? "hidden lg:table-cell px-5 py-3.5" : "px-5 py-3.5"}>
                  <div>
                    <p className="text-sm text-app-text">
                      {player.primary_position || "Not set"}
                    </p>
                    <p className="text-xs text-app-text-muted">
                      {player.phone_number || "No phone"}
                    </p>
                  </div>
                </td>

                <td className={isMobileHidden("rating") ? "hidden lg:table-cell px-5 py-3.5" : "px-5 py-3.5"}>
                  {player.player_rating || "0.00"}
                </td>

                <td className="px-5 py-3.5">
                  <AdminStatusBadge label={player.is_active ? "Active" : "Inactive"} />
                </td>

                <td className={isMobileHidden("joined") ? "hidden lg:table-cell px-3 py-3 text-app-text-muted" : "px-3 py-3 text-app-text-muted"}>
                  {formatDate(player.date_joined)}
                </td>

                <td className="px-5 py-3.5">
                  <AdminRowActions>
                    <Button size="sm" onClick={() => openEditModal(player)}>
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenBookingsModal(player)}
                    >
                      Bookings
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-app-border bg-app-surface-2 p-4">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={getPlayerDisplayName(editingPlayer)}
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-12 rounded-full border border-app-border object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">
                  {getPlayerInitials(editingPlayer)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-app-text">{getPlayerDisplayName(editingPlayer)}</p>
                <p className="text-sm text-app-text-muted">{editingPlayer.email || "No email"}</p>
              </div>
              <div className="ml-auto flex flex-wrap gap-1.5">
                {hasNewSelectedImage && (
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    New image
                  </span>
                )}
                {form.remove_image && (
                  <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                    Image removed
                  </span>
                )}
              </div>
            </div>
          ) : null}

          <div className="grid gap-5">
            <section className="rounded-xl border border-app-border p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-app-text">
                  Basic Information
                </h4>
                <p className="mt-0.5 text-xs text-app-text-muted">
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

            <section className="rounded-xl border border-app-border p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-app-text">
                  Player Profile
                </h4>
                <p className="mt-0.5 text-xs text-app-text-muted">
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

            <section className="rounded-xl border border-app-border p-5">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-app-text">
                  Profile Image
                </h4>
                <p className="mt-0.5 text-xs text-app-text-muted">
                  Upload a new image, keep the current one, or remove it.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  {currentImageUrl ? (
                    <img
                      src={currentImageUrl}
                      alt="Player preview"
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-20 rounded-xl border border-app-border object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-app-border bg-app-surface-2 text-xs text-app-text-muted">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="rounded-lg border border-dashed border-app-border bg-app-surface-2/60 p-4">
                    <label className="block text-sm font-medium text-app-text">
                      Upload New Image
                    </label>
                    <p className="mt-0.5 text-xs text-app-text-muted">
                      PNG, JPG, or WEBP · Max 1920px
                    </p>

                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="mt-3 block w-full text-sm text-app-text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-primary-hover"
                    />

                    {formErrors.fields.image ? (
                      <p className="mt-1.5 text-xs text-red-500">
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

      <AdminModal
        open={isBookingsModalOpen}
        onClose={handleCloseBookingsModal}
        size="xl"
        // title="Player Bookings"
        description={
          selectedPlayerForBookings
            ? `Viewing bookings for ${getPlayerDisplayName(selectedPlayerForBookings)}.`
            : "Viewing player bookings."
        }
        footer={
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseBookingsModal}
              disabled={isBookingsLoading}
            >
              Close
            </Button>
          </div>
        }
      >
        <AdminPlayerBookingsDetailsView
          playerName={
            selectedPlayerForBookings
              ? getPlayerDisplayName(selectedPlayerForBookings)
              : ""
          }
          bookings={selectedPlayerBookings}
          isLoading={isBookingsLoading}
        />
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
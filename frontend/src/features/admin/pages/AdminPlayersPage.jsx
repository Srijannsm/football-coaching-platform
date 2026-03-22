import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import { formatDate } from "../../../utils/formatDate";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import AdminPageHeader from "../components/layout/AdminPageHeader";
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
import { getAdminPlayers, updateAdminPlayer } from "../services/adminPlayersService";
import { useDebounce } from "../hooks/useDebounce";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  primary_position: "",
  player_rating: "",
  is_active: true,
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
  return [player?.first_name, player?.last_name].filter(Boolean).join(" ") || player?.username;
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

  function resetForm() {
    setEditingPlayerId(null);
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
    setFormErrors(initialFormErrors);

    setForm({
      first_name: player.first_name || "",
      last_name: player.last_name || "",
      email: player.email || "",
      phone_number: player.phone_number || "",
      primary_position: player.primary_position || "",
      player_rating: player.player_rating || "",
      is_active: Boolean(player.is_active),
    });

    setIsEditModalOpen(true);
  }

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

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
    if (!editingPlayerId) return;

    try {
      setIsSaving(true);
      setFormErrors(initialFormErrors);

      await updateAdminPlayer(editingPlayerId, {
        ...form,
        player_rating: form.player_rating === "" ? "" : Number(form.player_rating),
      });

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

      await updateAdminPlayer(playerToToggle.id, {
        is_active: !playerToToggle.is_active,
      });

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

  const modalFooter = (
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
  );

  return (
    <>
      <div className="space-y-6">
        {/* <AdminPageHeader
          title="Players"
          description="Search, edit, and manage registered academy players."
          actions={
            <Button variant="outline" onClick={loadPlayers}>
              Refresh
            </Button>
          }
        /> */}

        {pageError ? <Alert variant="error">{pageError}</Alert> : null}

        <AdminToolbar
          left={
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-3 py-2 shadow-sm">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                  Search
                </span>

                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Name, email, username, phone, or position"
                  className="h-10 min-w-[260px] rounded-xl border border-app-border bg-app-card px-4 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-3 py-2 shadow-sm">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                  Status
                </span>

                <select
                  value={table.filters.status}
                  onChange={(event) => table.updateFilter("status", event.target.value)}
                  className="h-10 rounded-xl border border-app-border bg-app-card px-3 text-sm font-medium text-app-text outline-none transition focus:border-brand-primary"
                >
                  <option value="">All players</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
              </div>

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
          description="Search and filter player accounts."
          contentClassName="p-0"
        >
          <AdminTable
            columns={[
              { key: "player", label: "Player" },
              { key: "contact", label: "Contact" },
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
            className="px-5 pb-5"
            renderRow={(player) => (
              <tr
                key={player.id}
                className="border-b border-app-border text-app-text transition hover:bg-app-surface-2/40"
              >
                <td className="px-3 py-3">
                  <p className="font-medium text-app-text">
                    {getPlayerDisplayName(player)}
                  </p>
                  <p className="text-xs text-app-text-muted">@{player.username}</p>
                </td>

                <td className="px-3 py-3">
                  <p>{player.email || "No email"}</p>
                  <p className="text-xs text-app-text-muted">
                    {player.phone_number || "No phone"}
                  </p>
                </td>

                <td className="px-3 py-3">{player.primary_position || "Not set"}</td>

                <td className="px-3 py-3">{player.player_rating || "0.00"}</td>

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
        description="Update player profile information, contact details, rating, and account status."
        footer={modalFooter}
      >
        <form id="player-form" onSubmit={handleSubmit} className="space-y-6">
          <AdminFormAlert message={formErrors.nonField} />

          <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-app-text">
                Personal Information
              </h3>
              <p className="mt-1 text-xs text-app-text-muted">
                Update the player name and primary account identity details.
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

          <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-app-text">
                Player Details
              </h3>
              <p className="mt-1 text-xs text-app-text-muted">
                Manage playing position, rating, and current activity status.
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
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(playerToToggle)}
        title={playerToToggle?.is_active ? "Deactivate Player" : "Reactivate Player"}
        description={
          playerToToggle
            ? playerToToggle.is_active
              ? `This will deactivate ${getPlayerDisplayName(
                playerToToggle
              )} and mark the account as inactive.`
              : `This will reactivate ${getPlayerDisplayName(
                playerToToggle
              )} and allow the account to be treated as active again.`
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
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
import AdminConfirmDialog from "../components/ui/AdminConfirmDialog";
import BulkActionBar from "../components/ui/BulkActionBar";
import { useAdminTable } from "../hooks/useAdminTable";
import { useRowSelection } from "../hooks/useRowSelection";
import {
  getAdminBookings,
  deleteAdminBooking,
  updateAdminBookingStatus,
  bulkUpdateAdminBookingStatus,
  bulkDeleteAdminBookings,
} from "../services/adminBookingsService";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All bookings" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const BULK_STATUS_OPTIONS = [
  { value: "pending", label: "Mark as Pending" },
  { value: "confirmed", label: "Mark as Confirmed" },
  { value: "cancelled", label: "Mark as Cancelled" },
];

const STATUS_UPDATE_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

function normalizeResponse(response) {
  if (Array.isArray(response)) {
    return { results: response, count: response.length };
  }
  return {
    results: response?.results || [],
    count: response?.count || 0,
  };
}

function getBookingPlayerLabel(booking) {
  return (
    booking.booked_by ||
    booking.player_name ||
    booking.player_username ||
    "Unknown player"
  );
}

function getBookingProgramLabel(booking) {
  return (
    booking.program_title ||
    booking.session_program_title ||
    booking.session_title ||
    "Training session"
  );
}

function formatBookingStatus(status) {
  if (status === "confirmed") return "Confirmed";
  if (status === "cancelled") return "Cancelled";
  return "Pending";
}

function CancelReasonDialog({ open, onConfirm, onClose, isLoading, bulkCount }) {
  const [reason, setReason] = useState("");

  function handleConfirm() {
    onConfirm(reason.trim());
    setReason("");
  }

  function handleClose() {
    setReason("");
    onClose();
  }

  if (!open) return null;

  const isBulk = bulkCount > 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-app-border bg-app-card p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-app-text">
          {isBulk ? `Cancel ${bulkCount} Bookings` : "Cancel Booking"}
        </h3>
        <p className="mt-2 text-sm text-app-text-muted">
          {isBulk
            ? `Provide a reason for cancelling these ${bulkCount} bookings. Players will be able to see this.`
            : "Provide a reason for cancelling this booking. The player will be able to see this."}
        </p>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-app-text-soft">
            Reason <span className="font-normal text-app-text-muted">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Session rescheduled, capacity reduced, admin decision..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text placeholder:text-app-text-muted outline-none focus:border-brand-primary"
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Go Back
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={isLoading}>
            {isBulk ? `Yes, Cancel ${bulkCount} Bookings` : "Yes, Cancel Booking"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminBookingsPage() {
  const table = useAdminTable({ initialFilters: { status: "" } });
  const [bookings, setBookings] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isStatusUpdatingId, setIsStatusUpdatingId] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [bulkDeletePending, setBulkDeletePending] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [bulkCancelPending, setBulkCancelPending] = useState(false);
  const [pageError, setPageError] = useState("");

  const {
    selectedIds,
    allPageSelected,
    somePageSelected,
    toggleSelectAll,
    toggleSelectRow,
    clearSelection,
  } = useRowSelection(bookings);

  async function loadBookings() {
    try {
      setIsLoading(true);
      setPageError("");
      const response = await getAdminBookings(table.queryState);
      const normalized = normalizeResponse(response);
      setBookings(normalized.results);
      setCount(normalized.count);
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to load bookings."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.queryState]);

  // ── Single-row status change ───────────────────────────────────────────────

  async function handleStatusChange(booking, status) {
    if ((booking.status || "pending") === status) return;
    if (status === "cancelled") {
      setCancelTarget(booking);
      return;
    }
    try {
      setIsStatusUpdatingId(booking.id);
      await updateAdminBookingStatus(booking.id, { status });
      await loadBookings();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to update booking status."));
    } finally {
      setIsStatusUpdatingId(null);
    }
  }

  async function handleCancelConfirm(reason) {
    if (bulkCancelPending) {
      setBulkCancelPending(false);
      const ids = Array.from(selectedIds);
      try {
        setIsBulkUpdating(true);
        await bulkUpdateAdminBookingStatus({
          booking_ids: ids,
          status: "cancelled",
          cancellation_reason: reason,
        });
        clearSelection();
        await loadBookings();
      } catch (err) {
        setPageError(getErrorMessage(err, "Failed to bulk cancel bookings."));
      } finally {
        setIsBulkUpdating(false);
      }
    } else {
      const booking = cancelTarget;
      setCancelTarget(null);
      try {
        setIsStatusUpdatingId(booking.id);
        await updateAdminBookingStatus(booking.id, {
          status: "cancelled",
          cancellation_reason: reason,
        });
        await loadBookings();
      } catch (err) {
        setPageError(getErrorMessage(err, "Failed to cancel booking."));
      } finally {
        setIsStatusUpdatingId(null);
      }
    }
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────

  async function handleBulkStatusApply(status) {
    if (selectedIds.size === 0) return;
    if (status === "cancelled") {
      setBulkCancelPending(true);
      return;
    }
    try {
      setIsBulkUpdating(true);
      await bulkUpdateAdminBookingStatus({
        booking_ids: Array.from(selectedIds),
        status,
      });
      clearSelection();
      await loadBookings();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to update bookings."));
    } finally {
      setIsBulkUpdating(false);
    }
  }

  async function handleBulkDeleteConfirm() {
    setBulkDeletePending(false);
    try {
      setIsBulkUpdating(true);
      await bulkDeleteAdminBookings(Array.from(selectedIds));
      clearSelection();
      await loadBookings();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to delete bookings."));
    } finally {
      setIsBulkUpdating(false);
    }
  }

  // ── Single-row delete ─────────────────────────────────────────────────────

  async function handleDeleteConfirm() {
    if (!bookingToDelete) return;
    try {
      setIsDeleting(true);
      await deleteAdminBooking(bookingToDelete.id);
      setBookingToDelete(null);
      await loadBookings();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to delete booking."));
    } finally {
      setIsDeleting(false);
    }
  }

  const bookingCountLabel = useMemo(() => {
    if (isLoading) return "Loading bookings...";
    return `${count} booking${count === 1 ? "" : "s"}`;
  }, [isLoading, count]);

  const cancelDialogOpen = Boolean(cancelTarget) || bulkCancelPending;
  const cancelDialogCount = bulkCancelPending ? selectedIds.size : 1;
  const cancelDialogLoading = bulkCancelPending
    ? isBulkUpdating
    : isStatusUpdatingId === cancelTarget?.id;

  return (
    <>
      <div className="space-y-6">
        {pageError ? <Alert variant="error">{pageError}</Alert> : null}

        <AdminSectionCard
          title="Booking Management"
          description="Update booking status and remove incorrect or duplicate records."
          contentClassName="p-0"
          actions={
            <AdminToolbar
              left={
                <div className="flex flex-wrap items-center gap-3 ml-auto">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-2.5 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/12 text-brand-primary">
                      <span className="text-sm font-semibold">#</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                        Total bookings
                      </p>
                      <p className="text-sm font-semibold text-app-text">
                        {bookingCountLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-3 py-2 shadow-sm">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                      Status
                    </p>
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
              { key: "player", label: "Player" },
              { key: "program", label: "Program" },
              { key: "status", label: "Status" },
              { key: "payment", label: "Payment" },
              { key: "booked_on", label: "Booked On" },
              { key: "actions", label: "Actions" },
            ]}
            data={bookings}
            isLoading={isLoading}
            emptyTitle="No bookings found"
            emptyDescription="Bookings will appear here once players start reserving sessions."
            className="pb-5"
            renderRow={(booking) => {
              const isUpdatingThisRow = isStatusUpdatingId === booking.id;
              const currentStatus = booking.status || "pending";
              const isSelected = selectedIds.has(booking.id);

              return (
                <tr
                  key={booking.id}
                  className={`border-b border-app-border text-app-text transition hover:bg-app-surface-2/40 ${
                    isSelected ? "bg-brand-primary/5" : ""
                  }`}
                >
                  <td className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(booking.id)}
                      className="h-4 w-4 cursor-pointer rounded border-app-border accent-brand-primary"
                    />
                  </td>

                  <td className="px-3 py-3">
                    <p className="font-medium text-app-text">
                      {getBookingPlayerLabel(booking)}
                    </p>
                    <p className="text-xs text-app-text-muted">
                      Booking #{booking.id}
                    </p>
                  </td>

                  <td className="px-3 py-3">
                    <p className="font-medium text-app-text">
                      {getBookingProgramLabel(booking)}
                    </p>
                    <p className="text-xs text-app-text-muted">
                      {booking.session_date
                        ? `Session date: ${formatDate(booking.session_date)}`
                        : "Session date not available"}
                    </p>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-2">
                      <AdminStatusBadge label={formatBookingStatus(currentStatus)} />
                      <select
                        value={currentStatus}
                        onChange={(event) =>
                          handleStatusChange(booking, event.target.value)
                        }
                        disabled={isUpdatingThisRow}
                        className="h-10 min-w-[150px] rounded-2xl border border-app-border bg-app-surface-2 px-3 text-sm text-app-text outline-none transition focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {STATUS_UPDATE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            Mark as {option.label}
                          </option>
                        ))}
                      </select>
                      {currentStatus === "cancelled" && booking.cancellation_reason && (
                        <p className="max-w-[200px] text-xs text-app-text-muted">
                          <span className="font-medium">Reason:</span>{" "}
                          {booking.cancellation_reason}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    {booking.payment_method ? (
                      <div className="flex flex-col gap-1.5">
                        <AdminStatusBadge
                          label={
                            { cash: "Cash", esewa: "eSewa", khalti: "Khalti" }[
                              booking.payment_method
                            ] ?? booking.payment_method
                          }
                        />
                        <AdminStatusBadge
                          label={
                            booking.payment_status === "completed"
                              ? "Paid"
                              : booking.payment_status === "failed"
                              ? "Failed"
                              : "Pending"
                          }
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-app-text-muted">—</span>
                    )}
                  </td>

                  <td className="px-3 py-3 text-app-text-muted">
                    {formatDate(booking.booked_at)}
                  </td>

                  <td className="px-3 py-3">
                    <AdminRowActions>
                      <Button
                        size="sm"
                        variant="danger-outline"
                        onClick={() => setBookingToDelete(booking)}
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

      <CancelReasonDialog
        open={cancelDialogOpen}
        onConfirm={handleCancelConfirm}
        onClose={() => {
          setCancelTarget(null);
          setBulkCancelPending(false);
        }}
        isLoading={cancelDialogLoading}
        bulkCount={cancelDialogCount}
      />

      <AdminConfirmDialog
        open={bulkDeletePending}
        title={`Delete ${selectedIds.size} Booking${selectedIds.size === 1 ? "" : "s"}`}
        description={`This action cannot be undone. ${selectedIds.size} booking${selectedIds.size === 1 ? "" : "s"} will be permanently removed.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setBulkDeletePending(false)}
        isLoading={isBulkUpdating}
      />

      <AdminConfirmDialog
        open={Boolean(bookingToDelete)}
        title="Delete Booking"
        description={
          bookingToDelete
            ? `This action cannot be undone. The booking for "${getBookingPlayerLabel(bookingToDelete)}" will be permanently removed.`
            : ""
        }
        confirmLabel="Delete Booking"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBookingToDelete(null)}
        isLoading={isDeleting}
      />
    </>
  );
}

export default AdminBookingsPage;

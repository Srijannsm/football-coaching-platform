import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import { formatDate } from "../../../utils/formatDate";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import AdminPageHeader from "../components/layout/AdminPageHeader";
import AdminToolbar from "../components/ui/AdminToolbar";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminTable from "../components/table/AdminTable";
import AdminRowActions from "../components/table/AdminRowActions";
import AdminStatusBadge from "../components/ui/AdminStatusBadge";
import AdminConfirmDialog from "../components/ui/AdminConfirmDialog";
import {
  getAdminBookings,
  deleteAdminBooking,
  updateAdminBookingStatus,
} from "../services/adminBookingsService";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All bookings" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_UPDATE_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

function normalizeList(response) {
  return Array.isArray(response) ? response : response?.results || [];
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

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusUpdatingId, setIsStatusUpdatingId] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [pageError, setPageError] = useState("");

  async function loadBookings(filter = statusFilter) {
    try {
      setIsLoading(true);
      setPageError("");

      const response = await getAdminBookings(
        filter ? { status: filter } : undefined
      );

      setBookings(normalizeList(response));
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to load bookings."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleStatusChange(booking, status) {
    if ((booking.status || "pending") === status) return;

    try {
      setIsStatusUpdatingId(booking.id);
      await updateAdminBookingStatus(booking.id, { status });
      await loadBookings(statusFilter);
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to update booking status."));
    } finally {
      setIsStatusUpdatingId(null);
    }
  }

  function handleDeleteClick(booking) {
    setBookingToDelete(booking);
  }

  function handleDeleteCancel() {
    setBookingToDelete(null);
  }

  async function handleDeleteConfirm() {
    if (!bookingToDelete) return;

    try {
      setIsDeleting(true);
      await deleteAdminBooking(bookingToDelete.id);
      setBookingToDelete(null);
      await loadBookings(statusFilter);
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to delete booking."));
    } finally {
      setIsDeleting(false);
    }
  }

  const bookingCountLabel = useMemo(() => {
    if (isLoading) return "Loading bookings...";
    return `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`;
  }, [isLoading, bookings.length]);

  return (
    <>
      <div className="space-y-6">
        {/* <AdminPageHeader
          title="Bookings"
          description="Review, confirm, cancel, and manage training session bookings."
          actions={
            <Button variant="outline" onClick={() => loadBookings()}>
              Refresh
            </Button>
          }
        /> */}

        {pageError ? <Alert variant="error">{pageError}</Alert> : null}

        <AdminToolbar
          left={
            <div className="flex items-center gap-3 ml-auto">
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
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                    Status
                  </p>
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    const nextFilter = event.target.value;
                    setStatusFilter(nextFilter);
                    loadBookings(nextFilter);
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

        <AdminSectionCard
          title="Booking Management"
          description="Update booking status and remove incorrect or duplicate records."
          contentClassName="p-0"
        >
          <AdminTable
            columns={[
              { key: "player", label: "Player" },
              { key: "program", label: "Program" },
              { key: "status", label: "Status" },
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

              return (
                <tr
                  key={booking.id}
                  className="border-b border-app-border text-app-text transition hover:bg-app-surface-2/40"
                >
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
                      <div>
                        <AdminStatusBadge label={formatBookingStatus(currentStatus)} />
                      </div>

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
                    </div>
                  </td>

                  <td className="px-3 py-3 text-app-text-muted">
                    {formatDate(booking.booked_at)}
                  </td>

                  <td className="px-3 py-3">
                    <AdminRowActions>
                      <Button
                        size="sm"
                        variant="danger-outline"
                        onClick={() => handleDeleteClick(booking)}
                      >
                        Delete
                      </Button>
                    </AdminRowActions>
                  </td>
                </tr>
              );
            }}
          />
        </AdminSectionCard>
      </div>

      <AdminConfirmDialog
        open={Boolean(bookingToDelete)}
        title="Delete Booking"
        description={
          bookingToDelete
            ? `This action cannot be undone. The booking for "${getBookingPlayerLabel(
              bookingToDelete
            )}" will be permanently removed.`
            : ""
        }
        confirmLabel="Delete Booking"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </>
  );
}

export default AdminBookingsPage;
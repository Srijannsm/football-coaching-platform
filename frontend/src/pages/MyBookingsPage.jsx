import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import { Card, CardContent } from "../components/ui/Card";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelBookingId, setCancelBookingId] = useState(null);

  async function fetchBookings() {
    try {
      const response = await api.get("/my-bookings/");
      setBookings(response.data.results || response.data);
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id) {
    setCancelBookingId(id);
    await api.put(`/my-bookings/${id}/cancel/`);
    await fetchBookings();
    setCancelBookingId(null);
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const upcoming = bookings.filter((b) => b.status !== "cancelled");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-16">
          <EmptyState
            title="Loading bookings..."
            description="Please wait while we fetch your bookings."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="mb-2 text-4xl font-bold">My Bookings</h1>
        <p className="mb-10 text-neutral-400">
          Manage your booked training sessions.
        </p>

        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="You haven't booked any sessions yet."
            action={
              <Link to="/training-sessions">
                <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                  Browse Sessions
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <section className="mb-16">
              <h2 className="mb-6 text-2xl font-bold">Upcoming Sessions</h2>

              {upcoming.length === 0 ? (
                <EmptyState
                  title="No upcoming sessions"
                  description="You do not have any active upcoming sessions."
                />
              ) : (
                <div className="space-y-5">
                  {upcoming.map((booking) => (
                    <Card
                      key={booking.id}
                      className="border-white/10 bg-neutral-900"
                    >
                      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {booking.program_title}
                          </h3>

                          <p className="text-sm text-neutral-400">
                            {booking.session_date} • {booking.start_time}
                          </p>

                          <p className="text-sm text-neutral-400">
                            Coach: {booking.coach_full_name}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <StatusBadge status={booking.status} />
                          <Button
                            onClick={() => cancelBooking(booking.id)}
                            loading={cancelBookingId === booking.id}
                            disabled={cancelBookingId === booking.id}
                            variant="danger"
                            className="rounded-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {cancelled.length > 0 && (
              <section>
                <h2 className="mb-6 text-2xl font-bold text-neutral-300">
                  Cancelled Sessions
                </h2>

                <div className="space-y-4">
                  {cancelled.map((booking) => (
                    <Card
                      key={booking.id}
                      className="border-white/10 bg-neutral-900 opacity-70"
                    >
                      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {booking.program_title}
                          </h3>

                          <p className="text-sm text-neutral-400">
                            {booking.session_date} • {booking.start_time}
                          </p>

                          <p className="text-sm text-neutral-400">
                            Coach: {booking.coach_full_name}
                          </p>
                        </div>

                        <StatusBadge status="cancelled" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelBookingId, setCancelBookingId] = useState(null);

  async function fetchBookings() {
    const response = await api.get("/my-bookings/");
    setBookings(response.data.results || response.data);
    setLoading(false);
  }

  async function cancelBooking(id) {
    setCancelBookingId(id);

    await api.put(`/my-bookings/${id}/cancel/`);

    fetchBookings();
    setCancelBookingId(null);
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const upcoming = bookings.filter(b => b.status !== "cancelled");
  const cancelled = bookings.filter(b => b.status === "cancelled");

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-16">

        <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
        <p className="text-neutral-400 mb-10">
          Manage your booked training sessions.
        </p>

        {/* UPCOMING SESSIONS */}
        <section className="mb-16">

          <h2 className="text-2xl font-bold mb-6">
            Upcoming Sessions
          </h2>

          {upcoming.length === 0 ? (
            <p className="text-neutral-400">
              You have no upcoming sessions.
            </p>
          ) : (

            <div className="space-y-5">

              {upcoming.map((booking) => (

                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-900 p-6"
                >

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

                  <button
                    onClick={() => cancelBooking(booking.id)}
                    disabled={cancelBookingId === booking.id}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold hover:bg-red-400"
                  >
                    {cancelBookingId === booking.id
                      ? "Cancelling..."
                      : "Cancel"}
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* CANCELLED SESSIONS */}
        {cancelled.length > 0 && (

          <section>

            <h2 className="text-2xl font-bold mb-6 text-neutral-300">
              Cancelled Sessions
            </h2>

            <div className="space-y-4">

              {cancelled.map((booking) => (

                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-900 p-6 opacity-70"
                >

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

                  <span className="text-sm text-red-400 font-semibold">
                    Cancelled
                  </span>

                </div>

              ))}

            </div>

          </section>

        )}

        {bookings.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-neutral-400 mb-4">
              You haven't booked any sessions yet.
            </p>

            <Link
              to="/training-sessions"
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold"
            >
              Browse Sessions
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default MyBookingsPage;
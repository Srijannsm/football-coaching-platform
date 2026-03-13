import { useEffect, useState } from "react";
import api from "../api/axios";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchBookings() {
    try {
      const response = await api.get("/my-bookings/");

      if (Array.isArray(response.data)) {
        setBookings(response.data);
      } else if (Array.isArray(response.data.results)) {
        setBookings(response.data.results);
      } else {
        setBookings([]);
      }

    } catch (err) {
      console.error("Failed to load bookings:", err);
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(bookingId) {
    try {
      await api.put(`/my-bookings/${bookingId}/cancel/`);

      // refresh bookings after cancel
      fetchBookings();

    } catch (err) {
      console.error("Cancel booking failed:", err);
      alert("Failed to cancel booking.");
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading bookings...</h2>;
  }

  if (error) {
    return <h2 style={{ textAlign: "center", color: "red" }}>{error}</h2>;
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Bookings</h1>

      {bookings.length === 0 ? (
        <p style={styles.empty}>You have no bookings.</p>
      ) : (
        <div style={styles.grid}>
          {bookings.map((booking) => (
            <div key={booking.id} style={styles.card}>
              <h2>{booking.program_title}</h2>

              <p><strong>Coach:</strong> {booking.coach_full_name}</p>
              <p><strong>Type:</strong> {booking.session_type}</p>
              <p><strong>Date:</strong> {booking.session_date}</p>
              <p><strong>Time:</strong> {booking.start_time} - {booking.end_time}</p>
              <p><strong>Location:</strong> {booking.location}</p>
              <p><strong>Price:</strong> Rs. {booking.price}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              {booking.status !== "cancelled" && (
                <button
                  style={styles.cancelButton}
                  onClick={() => cancelBooking(booking.id)}
                >
                  Cancel Booking
                </button>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    backgroundColor: "#f4f4f4"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px"
  },
  grid: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "grid",
    gap: "20px"
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)"
  },
  cancelButton: {
    marginTop: "12px",
    padding: "10px",
    width: "100%",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#c0392b",
    color: "white",
    cursor: "pointer"
  },
  empty: {
    textAlign: "center"
  }
};

export default MyBookingsPage;
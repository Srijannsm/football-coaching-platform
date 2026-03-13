import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function TrainingSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSessionId, setBookingSessionId] = useState(null);

  async function fetchPageData() {
    try {
      setError("");

      const [meResponse, sessionsResponse] = await Promise.all([
        api.get("/me/"),
        api.get("/training-sessions/"),
      ]);

      setUser(meResponse.data);

      if (Array.isArray(sessionsResponse.data)) {
        setSessions(sessionsResponse.data);
      } else if (Array.isArray(sessionsResponse.data.results)) {
        setSessions(sessionsResponse.data.results);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error("Failed to load page data:", err);

      if (err.response?.status === 401) {
        setError("You are not logged in. Please log in first.");
      } else {
        setError("Failed to load training sessions.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPageData();
  }, []);

  async function handleBookSession(sessionId) {
    try {
      setBookingMessage("");
      setBookingError("");
      setBookingSessionId(sessionId);

      await api.post("/bookings/", {
        session: sessionId,
      });

      setBookingMessage("Session booked successfully.");

      // Refresh sessions so available slots / full status update
      await fetchPageData();
    } catch (err) {
      console.error("Booking failed:", err);

      if (err.response?.data?.session) {
        const sessionError = err.response.data.session;
        setBookingError(
          Array.isArray(sessionError) ? sessionError[0] : sessionError
        );
      } else if (err.response?.data?.detail) {
        setBookingError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        setBookingError(err.response.data.non_field_errors[0]);
      } else {
        setBookingError("Failed to book the session.");
      }
    } finally {
      setBookingSessionId(null);
    }
  }

  if (loading) {
    return <h2 style={styles.message}>Loading training sessions...</h2>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Football Academy</h2>
          <p style={styles.error}>{error}</p>
          <Link to="/login" style={styles.linkButton}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <h1 style={styles.title}>Training Sessions</h1>
        <p style={styles.subtitle}>
          Welcome{user?.first_name ? `, ${user.first_name}` : ""}.
        </p>

        {bookingMessage && <p style={styles.successMessage}>{bookingMessage}</p>}
        {bookingError && <p style={styles.error}>{bookingError}</p>}

        <div style={styles.topActions}>
          <Link to="/my-bookings" style={styles.linkButton}>
            My Bookings
          </Link>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div style={styles.card}>
          <p style={styles.emptyText}>No training sessions available right now.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {sessions.map((session) => {
            const isBookingThisSession = bookingSessionId === session.id;

            return (
              <div key={session.id} style={styles.sessionCard}>
                <h2 style={styles.sessionTitle}>
                  {session.program_title || "Training Session"}
                </h2>

                <p>
                  <strong>Coach:</strong> {session.coach_full_name || "Not assigned"}
                </p>
                <p>
                  <strong>Type:</strong> {session.session_type || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong> {session.session_date}
                </p>
                <p>
                  <strong>Time:</strong> {session.start_time} - {session.end_time}
                </p>
                <p>
                  <strong>Location:</strong> {session.location || "Not set"}
                </p>
                <p>
                  <strong>Price:</strong> Rs. {session.price}
                </p>
                <p>
                  <strong>Available Slots:</strong> {session.available_slots}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {session.is_full ? "Full" : "Open for booking"}
                </p>

                <button
                  style={{
                    ...styles.bookButton,
                    ...(session.is_full || isBookingThisSession
                      ? styles.disabledButton
                      : {}),
                  }}
                  disabled={session.is_full || isBookingThisSession}
                  onClick={() => handleBookSession(session.id)}
                >
                  {session.is_full
                    ? "Session Full"
                    : isBookingThisSession
                    ? "Booking..."
                    : "Book Session"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f4f4",
    padding: "24px",
  },
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: "20px",
  },
  headerCard: {
    maxWidth: "1000px",
    margin: "0 auto 24px auto",
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  card: {
    maxWidth: "700px",
    margin: "0 auto",
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: "16px",
  },
  topActions: {
    display: "flex",
    justifyContent: "center",
    marginTop: "12px",
  },
  grid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  sessionCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    lineHeight: "1.8",
  },
  sessionTitle: {
    marginBottom: "12px",
  },
  linkButton: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: "8px",
    backgroundColor: "#222",
    color: "#fff",
    textDecoration: "none",
  },
  bookButton: {
    marginTop: "12px",
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#222",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },
  disabledButton: {
    backgroundColor: "#999",
    cursor: "not-allowed",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "12px",
  },
  successMessage: {
    color: "green",
    textAlign: "center",
    marginBottom: "12px",
  },
  emptyText: {
    textAlign: "center",
    margin: 0,
  },
  message: {
    textAlign: "center",
    marginTop: "40px",
  },
};

export default TrainingSessionsPage;
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function LoginPage() {
  // Stores what user types in the form
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // Stores error messages from failed login
  const [error, setError] = useState("");

  // Stores loading state to prevent double submit
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Runs whenever input changes
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  // Runs when the form is submitted
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login/", formData);

      const { access, refresh } = response.data;

      // Save tokens in browser storage
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // Redirect user after successful login
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);

      if (err.response && err.response.data) {
        setError("Invalid username or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>
        <p style={styles.subtitle}>Football Training Academy</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.footerText}>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "40px",
    marginBottom: "10px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "20px",
    marginBottom: "20px",
    textAlign: "center",
    color: "#555",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    margin: 0,
  },
  footerText: {
    marginTop: "16px",
    textAlign: "center",
  },
};

export default LoginPage;
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const initialFormData = {
  username: "",
  email: "",
  phone_number: "",
  first_name: "",
  last_name: "",
  password: "",
  confirm_password: "",
  age: "",
  preferred_foot: "",
  primary_position: "",
  secondary_position: "",
  height_cm: "",
  weight_kg: "",
};

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);

  // Stores field-specific validation errors, e.g. { username: "Username is required" }
  const [fieldErrors, setFieldErrors] = useState({});

  // Stores general API or form errors
  const [serverError, setServerError] = useState("");

  // Stores a success message before redirecting
  const [successMessage, setSuccessMessage] = useState("");

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error as the user edits
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Clear global server error while user is fixing data
    setServerError("");
  }

  function validateForm() {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required.";
    }

    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required.";
    }

    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!formData.confirm_password) {
      errors.confirm_password = "Please confirm your password.";
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match.";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (formData.age && Number(formData.age) < 0) {
      errors.age = "Age cannot be negative.";
    }

    if (formData.height_cm && Number(formData.height_cm) <= 0) {
      errors.height_cm = "Height must be greater than 0.";
    }

    if (formData.weight_kg && Number(formData.weight_kg) <= 0) {
      errors.weight_kg = "Weight must be greater than 0.";
    }

    return errors;
  }

  function extractBackendErrors(data) {
    // Converts DRF-style backend errors into a flat object/string for display
    const extractedFieldErrors = {};
    let fallbackMessage = "Registration failed. Please try again.";

    if (!data || typeof data !== "object") {
      return { extractedFieldErrors, fallbackMessage };
    }

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        extractedFieldErrors[key] = value[0];
      } else if (typeof value === "string") {
        extractedFieldErrors[key] = value;
      }
    });

    // non_field_errors is common in Django REST Framework
    if (data.non_field_errors?.length) {
      fallbackMessage = data.non_field_errors[0];
    } else {
      const firstValue = Object.values(data)[0];
      if (Array.isArray(firstValue)) {
        fallbackMessage = firstValue[0];
      } else if (typeof firstValue === "string") {
        fallbackMessage = firstValue;
      }
    }

    return { extractedFieldErrors, fallbackMessage };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setServerError("");
    setSuccessMessage("");

    const validationErrors = validateForm();
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await api.post("/register/", formData);

      setSuccessMessage("Registration successful. Redirecting to login...");

      // Small delay gives the user feedback before navigation
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.data) {
        const { extractedFieldErrors, fallbackMessage } = extractBackendErrors(
          err.response.data
        );

        setFieldErrors(extractedFieldErrors);
        setServerError(fallbackMessage);
      } else {
        setServerError("Something went wrong. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isFormValid = useMemo(() => {
    return (
      formData.username.trim().toLowerCase() &&
      formData.first_name.trim() &&
      formData.last_name.trim() &&
      formData.password &&
      formData.confirm_password &&
      formData.password === formData.confirm_password
    );
  }, [formData]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Player Account</h1>
        <p style={styles.subtitle}>
          Join the academy and start booking training sessions.
        </p>

        {serverError && (
          <div style={styles.alertError} role="alert" aria-live="polite">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div style={styles.alertSuccess} role="status" aria-live="polite">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.fieldGroup}>
            <label htmlFor="username" style={styles.label}>
              Username *
            </label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              style={styles.input}
              aria-invalid={!!fieldErrors.username}
            />
            {fieldErrors.username && (
              <span style={styles.fieldError}>{fieldErrors.username}</span>
            )}
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label htmlFor="first_name" style={styles.label}>
                First Name *
              </label>
              <input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First name"
                style={styles.input}
                aria-invalid={!!fieldErrors.first_name}
              />
              {fieldErrors.first_name && (
                <span style={styles.fieldError}>{fieldErrors.first_name}</span>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="last_name" style={styles.label}>
                Last Name *
              </label>
              <input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last name"
                style={styles.input}
                aria-invalid={!!fieldErrors.last_name}
              />
              {fieldErrors.last_name && (
                <span style={styles.fieldError}>{fieldErrors.last_name}</span>
              )}
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && (
              <span style={styles.fieldError}>{fieldErrors.email}</span>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="phone_number" style={styles.label}>
              Phone Number
            </label>
            <input
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="98XXXXXXXX"
              style={styles.input}
              aria-invalid={!!fieldErrors.phone_number}
            />
            {fieldErrors.phone_number && (
              <span style={styles.fieldError}>{fieldErrors.phone_number}</span>
            )}
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label htmlFor="password" style={styles.label}>
                Password *
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                style={styles.input}
                aria-invalid={!!fieldErrors.password}
              />
              {fieldErrors.password && (
                <span style={styles.fieldError}>{fieldErrors.password}</span>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="confirm_password" style={styles.label}>
                Confirm Password *
              </label>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                style={styles.input}
                aria-invalid={!!fieldErrors.confirm_password}
              />
              {fieldErrors.confirm_password && (
                <span style={styles.fieldError}>
                  {fieldErrors.confirm_password}
                </span>
              )}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label htmlFor="age" style={styles.label}>
                Age
              </label>
              <input
                id="age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
                min="0"
                style={styles.input}
                aria-invalid={!!fieldErrors.age}
              />
              {fieldErrors.age && (
                <span style={styles.fieldError}>{fieldErrors.age}</span>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="preferred_foot" style={styles.label}>
                Preferred Foot
              </label>
              <select
                id="preferred_foot"
                name="preferred_foot"
                value={formData.preferred_foot}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select foot</option>
                <option value="right">Right</option>
                <option value="left">Left</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label htmlFor="primary_position" style={styles.label}>
                Primary Position
              </label>
              <input
                id="primary_position"
                name="primary_position"
                value={formData.primary_position}
                onChange={handleChange}
                placeholder="e.g. Striker"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="secondary_position" style={styles.label}>
                Secondary Position
              </label>
              <input
                id="secondary_position"
                name="secondary_position"
                value={formData.secondary_position}
                onChange={handleChange}
                placeholder="e.g. Winger"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label htmlFor="height_cm" style={styles.label}>
                Height (cm)
              </label>
              <input
                id="height_cm"
                type="number"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
                placeholder="Height in cm"
                min="0"
                style={styles.input}
                aria-invalid={!!fieldErrors.height_cm}
              />
              {fieldErrors.height_cm && (
                <span style={styles.fieldError}>{fieldErrors.height_cm}</span>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="weight_kg" style={styles.label}>
                Weight (kg)
              </label>
              <input
                id="weight_kg"
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                placeholder="Weight in kg"
                min="0"
                style={styles.input}
                aria-invalid={!!fieldErrors.weight_kg}
              />
              {fieldErrors.weight_kg && (
                <span style={styles.fieldError}>{fieldErrors.weight_kg}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            style={{
              ...styles.button,
              ...(loading || !isFormValid ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login">Login</Link>
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
    background: "#f4f4f4",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "560px",
    background: "white",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: "45px",
    margin: "0 0 20px",
  },
  subtitle: {
    margin: "0 0 20px",
    color: "#555",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#222",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    marginTop: "8px",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  alertError: {
    marginBottom: "16px",
    padding: "12px 14px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: "14px",
  },
  alertSuccess: {
    marginBottom: "16px",
    padding: "12px 14px",
    borderRadius: "8px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "14px",
  },
  fieldError: {
    color: "#b91c1c",
    fontSize: "13px",
  },
  footerText: {
    marginTop: "18px",
    fontSize: "14px",
    color: "#444",
  },
};

export default RegisterPage;
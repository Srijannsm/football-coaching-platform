import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

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

  function inputClass(hasError) {
    return `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-neutral-500 ${
      hasError
        ? "border-red-500 bg-red-500/5 text-white focus:border-red-400"
        : "border-white/10 bg-neutral-900 text-white focus:border-yellow-400"
    }`;
  }

  function renderFieldError(error) {
    if (!error) return null;

    return <p className="mt-2 text-xs font-medium text-red-300">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* <Navbar /> */}

      <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[1.1fr_1.4fr]">
        <div className="hidden lg:flex flex-col justify-around border-r border-white/10 bg-gradient-to-br from-black via-neutral-950 to-neutral-900 p-12">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Join the Academy
            </p>

            <h1 className="max-w-xl text-5xl font-extrabold leading-tight">
              Build your player profile and start booking sessions.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-neutral-300">
              Create your account to access training sessions, manage your
              bookings, and grow with structured academy coaching.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <h3 className="mb-2 text-lg font-bold">Player Profile</h3>
              <p className="text-sm leading-7 text-neutral-300">
                Add football-specific details like preferred foot, position,
                height, and weight.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <h3 className="mb-2 text-lg font-bold">Easy Booking Flow</h3>
              <p className="text-sm leading-7 text-neutral-300">
                Once registered, you can browse sessions, book quickly, and
                manage your schedule from one place.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-10 lg:px-10 lg:py-12">
          <div className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur md:p-10">
            <div className="mb-8">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                Player Registration
              </p>
              <h2 className="text-3xl font-extrabold text-white md:text-4xl">
                Create your account
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
                Join the academy and start booking training sessions. Required
                fields are marked with *.
              </p>
            </div>

            {serverError && (
              <div
                className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                role="alert"
                aria-live="polite"
              >
                {serverError}
              </div>
            )}

            {successMessage && (
              <div
                className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                role="status"
                aria-live="polite"
              >
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              <section>
                <h3 className="mb-4 text-lg font-bold text-white">
                  Account Information
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="username"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Username *
                    </label>
                    <input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      className={inputClass(!!fieldErrors.username)}
                      aria-invalid={!!fieldErrors.username}
                    />
                    {renderFieldError(fieldErrors.username)}
                  </div>

                  <div>
                    <label
                      htmlFor="first_name"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      First Name *
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First name"
                      className={inputClass(!!fieldErrors.first_name)}
                      aria-invalid={!!fieldErrors.first_name}
                    />
                    {renderFieldError(fieldErrors.first_name)}
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Last Name *
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Last name"
                      className={inputClass(!!fieldErrors.last_name)}
                      aria-invalid={!!fieldErrors.last_name}
                    />
                    {renderFieldError(fieldErrors.last_name)}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={inputClass(!!fieldErrors.email)}
                      aria-invalid={!!fieldErrors.email}
                    />
                    {renderFieldError(fieldErrors.email)}
                  </div>

                  <div>
                    <label
                      htmlFor="phone_number"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="98XXXXXXXX"
                      className={inputClass(!!fieldErrors.phone_number)}
                      aria-invalid={!!fieldErrors.phone_number}
                    />
                    {renderFieldError(fieldErrors.phone_number)}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Password *
                    </label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      className={inputClass(!!fieldErrors.password)}
                      aria-invalid={!!fieldErrors.password}
                    />
                    {renderFieldError(fieldErrors.password)}
                  </div>

                  <div>
                    <label
                      htmlFor="confirm_password"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Confirm Password *
                    </label>
                    <input
                      id="confirm_password"
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className={inputClass(!!fieldErrors.confirm_password)}
                      aria-invalid={!!fieldErrors.confirm_password}
                    />
                    {renderFieldError(fieldErrors.confirm_password)}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-lg font-bold text-white">
                  Player Details
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="age"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
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
                      className={inputClass(!!fieldErrors.age)}
                      aria-invalid={!!fieldErrors.age}
                    />
                    {renderFieldError(fieldErrors.age)}
                  </div>

                  <div>
                    <label
                      htmlFor="preferred_foot"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Preferred Foot
                    </label>
                    <select
                      id="preferred_foot"
                      name="preferred_foot"
                      value={formData.preferred_foot}
                      onChange={handleChange}
                      className={inputClass(false)}
                    >
                      <option value="">Select foot</option>
                      <option value="right">Right</option>
                      <option value="left">Left</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="primary_position"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Primary Position
                    </label>
                    <input
                      id="primary_position"
                      name="primary_position"
                      value={formData.primary_position}
                      onChange={handleChange}
                      placeholder="e.g. Striker"
                      className={inputClass(false)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="secondary_position"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
                      Secondary Position
                    </label>
                    <input
                      id="secondary_position"
                      name="secondary_position"
                      value={formData.secondary_position}
                      onChange={handleChange}
                      placeholder="e.g. Winger"
                      className={inputClass(false)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="height_cm"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
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
                      className={inputClass(!!fieldErrors.height_cm)}
                      aria-invalid={!!fieldErrors.height_cm}
                    />
                    {renderFieldError(fieldErrors.height_cm)}
                  </div>

                  <div>
                    <label
                      htmlFor="weight_kg"
                      className="mb-2 block text-sm font-semibold text-white"
                    >
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
                      className={inputClass(!!fieldErrors.weight_kg)}
                      aria-invalid={!!fieldErrors.weight_kg}
                    />
                    {renderFieldError(fieldErrors.weight_kg)}
                  </div>
                </div>
              </section>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className={`w-full rounded-full px-5 py-3 text-sm font-bold transition ${
                  loading || !isFormValid
                    ? "cursor-not-allowed bg-neutral-700 text-neutral-300"
                    : "bg-yellow-400 text-black hover:bg-yellow-300"
                }`}
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-yellow-400 hover:text-yellow-300"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { Card, CardContent } from "../components/ui/Card";
import ImageUploadField from "../components/ui/ImageUploadField";
import { useToast } from "../context/ToastContext";

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

const preferredFootOptions = [
  { value: "", label: "Select foot" },
  { value: "right", label: "Right" },
  { value: "left", label: "Left" },
  { value: "both", label: "Both" },
];

function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

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

  function handleImageSelect(file, validationError) {
    if (validationError) {
      setImageError(validationError);
      return;
    }

    setImageError("");
    setServerError("");

    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  }

  function handleRemoveImage() {
    setProfileImageFile(null);
    setProfileImagePreview("");
    setImageError("");
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
      const payload = new FormData();

      payload.append("username", formData.username || "");
      payload.append("email", formData.email || "");
      payload.append("phone_number", formData.phone_number || "");
      payload.append("first_name", formData.first_name || "");
      payload.append("last_name", formData.last_name || "");
      payload.append("password", formData.password || "");
      payload.append("confirm_password", formData.confirm_password || "");
      payload.append("age", formData.age || "");
      payload.append("preferred_foot", formData.preferred_foot || "");
      payload.append("primary_position", formData.primary_position || "");
      payload.append("secondary_position", formData.secondary_position || "");
      payload.append("height_cm", formData.height_cm || "");
      payload.append("weight_kg", formData.weight_kg || "");

      if (profileImageFile) {
        payload.append("image", profileImageFile);
      }

      await api.post("/register/", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // setSuccessMessage("Registration successful. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

      showToast("Registration successful.", "success");

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
    return Boolean(
      formData.username.trim() &&
      formData.first_name.trim() &&
      formData.last_name.trim() &&
      formData.password &&
      formData.confirm_password &&
      formData.password === formData.confirm_password
    );
  }, [formData]);

  const darkInputClass =
    "border-white/10 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-yellow-400 focus:ring-yellow-400/10";
  const darkLabelClass = "text-white font-semibold";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_1.4fr]">
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
                height, weight, and profile image.
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
          <Card className="mx-auto w-full max-w-4xl rounded-3xl border-white/10 bg-white/5 shadow-2xl backdrop-blur">
            <CardContent className="p-8 md:p-10">
              <Link
                to="/"
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                <span className="text-base">←</span>
                <span>Back to home</span>
              </Link>

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
                      <Input
                        id="username"
                        name="username"
                        label="Username *"
                        labelClassName={darkLabelClass}
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        error={fieldErrors.username}
                        aria-invalid={!!fieldErrors.username}
                        className={darkInputClass}
                      />
                    </div>

                    <Input
                      id="first_name"
                      name="first_name"
                      label="First Name *"
                      labelClassName={darkLabelClass}
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First name"
                      error={fieldErrors.first_name}
                      aria-invalid={!!fieldErrors.first_name}
                      className={darkInputClass}
                    />

                    <Input
                      id="last_name"
                      name="last_name"
                      label="Last Name *"
                      labelClassName={darkLabelClass}
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Last name"
                      error={fieldErrors.last_name}
                      aria-invalid={!!fieldErrors.last_name}
                      className={darkInputClass}
                    />

                    <Input
                      id="email"
                      type="email"
                      name="email"
                      label="Email"
                      labelClassName={darkLabelClass}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      error={fieldErrors.email}
                      aria-invalid={!!fieldErrors.email}
                      className={darkInputClass}
                    />

                    <Input
                      id="phone_number"
                      name="phone_number"
                      label="Phone Number"
                      labelClassName={darkLabelClass}
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="98XXXXXXXX"
                      error={fieldErrors.phone_number}
                      aria-invalid={!!fieldErrors.phone_number}
                      className={darkInputClass}
                    />

                    <Input
                      id="password"
                      type="password"
                      name="password"
                      label="Password *"
                      labelClassName={darkLabelClass}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      error={fieldErrors.password}
                      aria-invalid={!!fieldErrors.password}
                      className={darkInputClass}
                    />

                    <Input
                      id="confirm_password"
                      type="password"
                      name="confirm_password"
                      label="Confirm Password *"
                      labelClassName={darkLabelClass}
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      error={fieldErrors.confirm_password}
                      aria-invalid={!!fieldErrors.confirm_password}
                      className={darkInputClass}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold text-white">
                    Player Details
                  </h3>

                  <div className="mb-6">
                    <div className="mb-6">
                      <ImageUploadField
                        label="Profile Image"
                        previewUrl={profileImagePreview}
                        onFileSelect={handleImageSelect}
                        onRemove={handleRemoveImage}
                        error={imageError}
                        helperText="JPG, PNG, or WEBP. Maximum size 2MB."
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Input
                      id="age"
                      type="number"
                      name="age"
                      label="Age"
                      labelClassName={darkLabelClass}
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Age"
                      min="0"
                      error={fieldErrors.age}
                      aria-invalid={!!fieldErrors.age}
                      className={darkInputClass}
                    />

                    <Select
                      id="preferred_foot"
                      name="preferred_foot"
                      label="Preferred Foot"
                      labelClassName={darkLabelClass}
                      value={formData.preferred_foot}
                      onChange={handleChange}
                      options={preferredFootOptions}
                      error={fieldErrors.preferred_foot}
                      className={darkInputClass}
                    />

                    <Input
                      id="primary_position"
                      name="primary_position"
                      label="Primary Position"
                      labelClassName={darkLabelClass}
                      value={formData.primary_position}
                      onChange={handleChange}
                      placeholder="e.g. Striker"
                      error={fieldErrors.primary_position}
                      className={darkInputClass}
                    />

                    <Input
                      id="secondary_position"
                      name="secondary_position"
                      label="Secondary Position"
                      labelClassName={darkLabelClass}
                      value={formData.secondary_position}
                      onChange={handleChange}
                      placeholder="e.g. Winger"
                      error={fieldErrors.secondary_position}
                      className={darkInputClass}
                    />

                    <Input
                      id="height_cm"
                      type="number"
                      name="height_cm"
                      label="Height (cm)"
                      labelClassName={darkLabelClass}
                      value={formData.height_cm}
                      onChange={handleChange}
                      placeholder="Height in cm"
                      min="0"
                      error={fieldErrors.height_cm}
                      aria-invalid={!!fieldErrors.height_cm}
                      className={darkInputClass}
                    />

                    <Input
                      id="weight_kg"
                      type="number"
                      name="weight_kg"
                      label="Weight (kg)"
                      labelClassName={darkLabelClass}
                      value={formData.weight_kg}
                      onChange={handleChange}
                      placeholder="Weight in kg"
                      min="0"
                      error={fieldErrors.weight_kg}
                      aria-invalid={!!fieldErrors.weight_kg}
                      className={darkInputClass}
                    />
                  </div>
                </section>

                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading || !isFormValid}
                  fullWidth
                  className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Register
                </Button>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
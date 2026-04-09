import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEO from "../components/SEO";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import { Card, CardContent } from "../components/ui/Card";
import ImageUploadField from "../components/ui/ImageUploadField";
import { useToast } from "../hooks/useToast";
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

const preferredFootOptions = [
  { value: "", label: "Select foot" },
  { value: "right", label: "Right" },
  { value: "left", label: "Left" },
  { value: "both", label: "Both" },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      {[1, 2].map((step) => {
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        return (
          <div key={step} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  isCompleted
                    ? "bg-brand-primary text-black"
                    : isActive
                    ? "bg-brand-primary text-black shadow-md ring-4 ring-brand-primary/20"
                    : "bg-app-surface-2 text-app-text-muted"
                }`}
              >
                {isCompleted ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-app-text" : "text-app-text-muted"
                }`}
              >
                {step === 1 ? "Account" : "Player Profile"}
              </span>
            </div>
            {step < 2 && (
              <div
                className={`h-px w-12 transition-all ${
                  isCompleted ? "bg-brand-primary" : "bg-app-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const objectUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  }

  function handleImageSelect(file, validationError) {
    if (validationError) { setImageError(validationError); return; }
    setImageError("");
    setServerError("");
    if (file) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setProfileImageFile(file);
      setProfileImagePreview(url);
    }
  }

  function handleRemoveImage() {
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
    setProfileImageFile(null);
    setProfileImagePreview("");
    setImageError("");
    setServerError("");
  }

  function validateStep1() {
    const errors = {};
    if (!formData.username.trim()) errors.username = "Username is required.";
    if (!formData.first_name.trim()) errors.first_name = "First name is required.";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required.";
    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (!formData.confirm_password) {
      errors.confirm_password = "Please confirm your password.";
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match.";
    }
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (formData.phone_number && !/^\+?\d{7,15}$/.test(formData.phone_number.replace(/\s/g, ""))) {
      errors.phone_number = "Enter a valid phone number (7–15 digits, optional + prefix).";
    }
    return errors;
  }

  function validateStep2() {
    const errors = {};
    if (formData.age && Number(formData.age) < 0) errors.age = "Age cannot be negative.";
    if (formData.height_cm && Number(formData.height_cm) <= 0) errors.height_cm = "Height must be greater than 0.";
    if (formData.weight_kg && Number(formData.weight_kg) <= 0) errors.weight_kg = "Weight must be greater than 0.";
    return errors;
  }

  function extractBackendErrors(data) {
    const extractedFieldErrors = {};
    let fallbackMessage = "Registration failed. Please try again.";
    if (!data || typeof data !== "object") return { extractedFieldErrors, fallbackMessage };
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) extractedFieldErrors[key] = value[0];
      else if (typeof value === "string") extractedFieldErrors[key] = value;
    });
    if (data.non_field_errors?.length) fallbackMessage = data.non_field_errors[0];
    else {
      const firstValue = Object.values(data)[0];
      if (Array.isArray(firstValue)) fallbackMessage = firstValue[0];
      else if (typeof firstValue === "string") fallbackMessage = firstValue;
    }
    return { extractedFieldErrors, fallbackMessage };
  }

  function handleNextStep() {
    const errors = validateStep1();
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const step2Errors = validateStep2();
    setFieldErrors(step2Errors);
    if (Object.keys(step2Errors).length > 0) return;

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
      if (profileImageFile) payload.append("image", profileImageFile);

      await api.post("/register/", payload, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Registration successful. Check your email to verify.", "success");
      navigate("/register-success");
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response?.data) {
        const { extractedFieldErrors, fallbackMessage } = extractBackendErrors(err.response.data);
        // If errors relate to step 1, go back
        const step1Keys = ["username", "email", "phone_number", "first_name", "last_name", "password", "confirm_password"];
        const hasStep1Errors = step1Keys.some((k) => extractedFieldErrors[k]);
        if (hasStep1Errors) setStep(1);
        setFieldErrors(extractedFieldErrors);
        setServerError(fallbackMessage);
      } else {
        setServerError("Something went wrong. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  const step1Valid = useMemo(() => Boolean(
    formData.username.trim() &&
    formData.first_name.trim() &&
    formData.last_name.trim() &&
    formData.password &&
    formData.confirm_password &&
    formData.password === formData.confirm_password
  ), [formData]);

  return (
    <div className="app-shell">
      <SEO title="Create Account" description="Join Football Academy. Create your player account to browse and book professional football training sessions." noindex />
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.35fr]">
        {/* Left panel */}
        <div className="hidden border-r border-app-border bg-app-surface px-10 py-12 lg:flex lg:flex-col lg:justify-around">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Join the Academy
            </p>
            <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight text-app-text">
              Build your player profile and start booking sessions.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-app-text-soft">
              Create your account to access training sessions, manage your bookings, and grow with structured academy coaching.
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-app-text">Player Profile</h3>
                <p className="mt-2 text-sm leading-7 text-app-text-soft">
                  Add football-specific details like preferred foot, position, height, weight, and profile image.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-app-text">Easy Booking Flow</h3>
                <p className="mt-2 text-sm leading-7 text-app-text-soft">
                  Once registered, you can browse sessions, book quickly, and manage your schedule from one place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form panel */}
        <div className="px-6 py-10 lg:px-10 lg:py-12">
          <Card className="mx-auto w-full max-w-2xl">
            <CardContent className="p-8 md:p-10">
              <Link
                to="/"
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-app-border bg-app-card px-4 py-2 text-sm font-medium text-app-text-soft transition hover:border-brand-primary hover:text-app-text"
              >
                <span className="text-base">←</span>
                <span>Back to home</span>
              </Link>

              <div className="mb-2">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                  Player Registration
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-app-text md:text-4xl">
                  Create your account
                </h2>
                <p className="mt-2 text-sm leading-6 text-app-text-soft">
                  {step === 1
                    ? "Enter your account details to get started."
                    : "Add your football profile — all fields are optional."}
                </p>
              </div>

              <StepIndicator currentStep={step} />

              {serverError && (
                <div className="mb-6">
                  <Alert variant="error">{serverError}</Alert>
                </div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Input
                        id="username"
                        name="username"
                        label="Username *"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        autoComplete="username"
                        error={fieldErrors.username}
                      />
                    </div>

                    <Input
                      id="first_name"
                      name="first_name"
                      label="First Name *"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="First name"
                      autoComplete="given-name"
                      error={fieldErrors.first_name}
                    />

                    <Input
                      id="last_name"
                      name="last_name"
                      label="Last Name *"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Last name"
                      autoComplete="family-name"
                      error={fieldErrors.last_name}
                    />

                    <Input
                      id="email"
                      type="email"
                      name="email"
                      label="Email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      error={fieldErrors.email}
                    />

                    <Input
                      id="phone_number"
                      name="phone_number"
                      label="Phone Number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="98XXXXXXXX"
                      autoComplete="tel"
                      error={fieldErrors.phone_number}
                    />

                    <div>
                      <Input
                        id="password"
                        type="password"
                        name="password"
                        label="Password *"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        showToggle
                        error={fieldErrors.password}
                      />
                      {formData.password && !fieldErrors.password && (
                        <p className={`mt-1.5 text-xs font-medium ${formData.password.length >= 8 ? "text-app-success-text" : "text-app-warning-text"}`}>
                          {formData.password.length >= 8
                            ? `✓ ${formData.password.length} characters`
                            : `${8 - formData.password.length} more character${8 - formData.password.length !== 1 ? "s" : ""} needed`}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        id="confirm_password"
                        type="password"
                        name="confirm_password"
                        label="Confirm Password *"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        showToggle
                        error={fieldErrors.confirm_password}
                      />
                      {formData.confirm_password && !fieldErrors.confirm_password && (
                        <p className={`mt-1.5 text-xs font-medium ${formData.password === formData.confirm_password ? "text-app-success-text" : "text-app-danger-text"}`}>
                          {formData.password === formData.confirm_password ? "✓ Passwords match" : "✗ Passwords do not match"}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!step1Valid}
                    fullWidth
                  >
                    Continue to Player Profile →
                  </Button>

                  <p className="text-center text-sm text-app-text-soft">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-brand-primary hover:text-app-text">
                      Login
                    </Link>
                  </p>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text-soft">
                    All fields on this step are <span className="font-medium text-app-text">optional</span>. You can complete your profile later from the dashboard.
                  </div>

                  <div className="mb-2">
                    <ImageUploadField
                      label="Profile Image"
                      previewUrl={profileImagePreview}
                      onFileSelect={handleImageSelect}
                      onRemove={handleRemoveImage}
                      error={imageError}
                      helperText="JPG, PNG, or WEBP. Maximum size 2MB."
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      id="age"
                      type="number"
                      name="age"
                      label="Age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Age"
                      min="0"
                      error={fieldErrors.age}
                    />

                    <Select
                      id="preferred_foot"
                      name="preferred_foot"
                      label="Preferred Foot"
                      value={formData.preferred_foot}
                      onChange={handleChange}
                      options={preferredFootOptions}
                      error={fieldErrors.preferred_foot}
                    />

                    <Input
                      id="primary_position"
                      name="primary_position"
                      label="Primary Position"
                      value={formData.primary_position}
                      onChange={handleChange}
                      placeholder="e.g. Striker"
                      error={fieldErrors.primary_position}
                    />

                    <Input
                      id="secondary_position"
                      name="secondary_position"
                      label="Secondary Position"
                      value={formData.secondary_position}
                      onChange={handleChange}
                      placeholder="e.g. Winger"
                      error={fieldErrors.secondary_position}
                    />

                    <Input
                      id="height_cm"
                      type="number"
                      name="height_cm"
                      label="Height (cm)"
                      value={formData.height_cm}
                      onChange={handleChange}
                      placeholder="Height in cm"
                      min="0"
                      error={fieldErrors.height_cm}
                    />

                    <Input
                      id="weight_kg"
                      type="number"
                      name="weight_kg"
                      label="Weight (kg)"
                      value={formData.weight_kg}
                      onChange={handleChange}
                      placeholder="Weight in kg"
                      min="0"
                      error={fieldErrors.weight_kg}
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="sm:w-auto"
                    >
                      ← Back
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                      disabled={loading}
                      fullWidth
                    >
                      Create Account
                    </Button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-center text-sm text-app-text-muted underline-offset-2 hover:text-app-text hover:underline disabled:opacity-50"
                  >
                    Skip and create account without profile details
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

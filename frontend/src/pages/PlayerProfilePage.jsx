import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getPlayerProfile,
  updatePlayerProfile,
} from "../services/playerProfileService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { Card, CardContent } from "../components/ui/Card";
import ImageUploadField from "../components/ui/ImageUploadField";
import { useToast } from "../context/ToastContext";

const preferredFootOptions = [
  { value: "", label: "Select preferred foot" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "both", label: "Both" },
];

function PlayerProfilePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    age: "",
    preferred_foot: "",
    primary_position: "",
    secondary_position: "",
    height_cm: "",
    weight_kg: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const darkInputClass =
    "border-white/10 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-yellow-400 focus:ring-yellow-400/10";
  const darkLabelClass = "font-semibold text-white";

  async function fetchProfile() {
    try {
      setError("");
      const profile = await getPlayerProfile();

      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        age: profile.age ?? "",
        preferred_foot: profile.preferred_foot || "",
        primary_position: profile.primary_position || "",
        secondary_position: profile.secondary_position || "",
        height_cm: profile.height_cm ?? "",
        weight_kg: profile.weight_kg ?? "",
      });

      setProfileImagePreview(profile.image || "");
      setRemoveImage(false);
    } catch (err) {
      console.error("Failed to load profile:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  }

  function handleImageSelect(file, validationError) {
    if (validationError) {
      setImageError(validationError);
      return;
    }

    setImageError("");
    setError("");

    if (file) {
      setRemoveImage(false);
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  }

  function handleRemoveImage() {
    setProfileImageFile(null);
    setProfileImagePreview("");
    setRemoveImage(true);
    setImageError("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = new FormData();

      payload.append("first_name", formData.first_name || "");
      payload.append("last_name", formData.last_name || "");
      payload.append("email", formData.email || "");
      payload.append("phone_number", formData.phone_number || "");
      payload.append("age", formData.age || "");
      payload.append("preferred_foot", formData.preferred_foot || "");
      payload.append("primary_position", formData.primary_position || "");
      payload.append("secondary_position", formData.secondary_position || "");
      payload.append("height_cm", formData.height_cm || "");
      payload.append("weight_kg", formData.weight_kg || "");
      payload.append("remove_image", removeImage ? "true" : "false");

      if (profileImageFile) {
        payload.append("image", profileImageFile);
      }

      const updatedProfile = await updatePlayerProfile({
        formData,
        profileImageFile,
        removeImage,
      });

      setFormData({
        first_name: updatedProfile.first_name || "",
        last_name: updatedProfile.last_name || "",
        email: updatedProfile.email || "",
        phone_number: updatedProfile.phone_number || "",
        age: updatedProfile.age ?? "",
        preferred_foot: updatedProfile.preferred_foot || "",
        primary_position: updatedProfile.primary_position || "",
        secondary_position: updatedProfile.secondary_position || "",
        height_cm: updatedProfile.height_cm ?? "",
        weight_kg: updatedProfile.weight_kg ?? "",
      });

      setProfileImagePreview(updatedProfile.image || "");
      setProfileImageFile(null);
      setRemoveImage(false);

      showToast("Profile updated successfully.", "success");
    } catch (err) {
      console.error("Failed to update profile:", err);

      if (err.response?.data) {
        const data = err.response.data;

        if (data.detail) {
          setError(data.detail);
        } else {
          const firstErrorKey = Object.keys(data)[0];
          const firstErrorValue = data[firstErrorKey];

          setError(
            Array.isArray(firstErrorValue)
              ? firstErrorValue[0]
              : "Failed to update profile."
          );
        }
      } else {
        setError("Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-24 lg:px-10">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-10 text-center">
              <h2 className="text-2xl font-bold text-white">
                Loading profile...
              </h2>
              <p className="mt-3 text-neutral-400">
                Please wait while we fetch your player profile.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <section className="border-b border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
          <div className="mb-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              ← Back
            </Button>
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
            Player Profile
          </p>

          <h1 className="text-4xl font-extrabold md:text-5xl">
            Edit Your Profile
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-300">
            Keep your personal and football details up to date so your academy
            profile stays accurate.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/player-dashboard"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 pb-14 lg:px-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300">
            {error}
          </div>
        )}

        <Card className="border-white/10 bg-white/5 shadow-xl backdrop-blur">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <section>
                <ImageUploadField
                  label="Profile Picture"
                  previewUrl={profileImagePreview}
                  onFileSelect={handleImageSelect}
                  onRemove={handleRemoveImage}
                  error={imageError}
                  helperText="JPG, PNG, or WEBP. Maximum size 2MB."
                />
              </section>

              <section>
                <h3 className="mb-4 text-lg font-bold text-white">
                  Personal Information
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    name="first_name"
                    label="First Name"
                    labelClassName={darkLabelClass}
                    value={formData.first_name}
                    onChange={handleChange}
                    className={darkInputClass}
                  />

                  <Input
                    name="last_name"
                    label="Last Name"
                    labelClassName={darkLabelClass}
                    value={formData.last_name}
                    onChange={handleChange}
                    className={darkInputClass}
                  />

                  <Input
                    type="email"
                    name="email"
                    label="Email"
                    labelClassName={darkLabelClass}
                    value={formData.email}
                    onChange={handleChange}
                    className={darkInputClass}
                  />

                  <Input
                    name="phone_number"
                    label="Phone Number"
                    labelClassName={darkLabelClass}
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={darkInputClass}
                  />
                </div>
              </section>

              <section>
                <h3 className="mb-4 text-lg font-bold text-white">
                  Football Details
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    type="number"
                    name="age"
                    label="Age"
                    labelClassName={darkLabelClass}
                    value={formData.age}
                    onChange={handleChange}
                    className={darkInputClass}
                  />

                  <Select
                    name="preferred_foot"
                    label="Preferred Foot"
                    labelClassName={darkLabelClass}
                    value={formData.preferred_foot}
                    onChange={handleChange}
                    options={preferredFootOptions}
                    className={darkInputClass}
                  />

                  <Input
                    name="primary_position"
                    label="Primary Position"
                    labelClassName={darkLabelClass}
                    value={formData.primary_position}
                    onChange={handleChange}
                    className={darkInputClass}
                  />

                  <Input
                    name="secondary_position"
                    label="Secondary Position"
                    labelClassName={darkLabelClass}
                    value={formData.secondary_position}
                    onChange={handleChange}
                    className={darkInputClass}
                  />

                  <Input
                    type="number"
                    name="height_cm"
                    label="Height (cm)"
                    labelClassName={darkLabelClass}
                    value={formData.height_cm}
                    onChange={handleChange}
                    className={darkInputClass}
                  />

                  <Input
                    type="number"
                    name="weight_kg"
                    label="Weight (kg)"
                    labelClassName={darkLabelClass}
                    value={formData.weight_kg}
                    onChange={handleChange}
                    className={darkInputClass}
                  />
                </div>
              </section>

              <div className="flex flex-wrap gap-4">
                <Button
                  type="submit"
                  loading={saving}
                  disabled={saving}
                  className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Save Changes
                </Button>

                <Link
                  to="/dashboard"
                  className="rounded-full border border-white/10 px-6 py-3 text-sm font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default PlayerProfilePage;
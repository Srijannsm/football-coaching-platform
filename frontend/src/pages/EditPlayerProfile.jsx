import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPlayerProfile,
  updatePlayerProfile,
} from "../services/playerProfileService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import { Card, CardContent } from "../components/ui/Card";
import ImageUploadField from "../components/ui/ImageUploadField";
import { useToast } from "../context/ToastContext";

const preferredFootOptions = [
  { value: "", label: "Select preferred foot" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "both", label: "Both" },
];

function EditProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-[1.5rem] bg-app-card" />
      <div className="h-[640px] animate-pulse rounded-[1.5rem] bg-app-card" />
    </div>
  );
}

function EditPlayerProfile() {
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

  async function fetchProfile() {
    try {
      setError("");
      setLoading(true);

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
    return <EditProfileSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <Card className="border-brand-primary/10 bg-gradient-to-r from-brand-primary/5 via-transparent to-transparent">
        {/* <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                Profile Settings
              </p>
              <h2 className="text-2xl font-black tracking-tight text-app-text md:text-3xl">
                Edit Your Profile
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-app-text-soft md:text-base">
                Keep your personal and football details up to date so your
                academy profile stays accurate and useful across the platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/player-dashboard/profile">
                <Button variant="outline">View Profile</Button>
              </Link>

              <Link to="/player-dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </CardContent> */}
      </Card>

      {/* Error state */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Form */}
      <Card>
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
              <h3 className="mb-4 text-lg font-bold text-app-text">
                Personal Information
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  name="first_name"
                  label="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                />

                <Input
                  name="last_name"
                  label="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                />

                <Input
                  type="email"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <Input
                  name="phone_number"
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-lg font-bold text-app-text">
                Football Details
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  type="number"
                  name="age"
                  label="Age"
                  value={formData.age}
                  onChange={handleChange}
                />

                <Select
                  name="preferred_foot"
                  label="Preferred Foot"
                  value={formData.preferred_foot}
                  onChange={handleChange}
                  options={preferredFootOptions}
                />

                <Input
                  name="primary_position"
                  label="Primary Position"
                  value={formData.primary_position}
                  onChange={handleChange}
                />

                <Input
                  name="secondary_position"
                  label="Secondary Position"
                  value={formData.secondary_position}
                  onChange={handleChange}
                />

                <Input
                  type="number"
                  name="height_cm"
                  label="Height (cm)"
                  value={formData.height_cm}
                  onChange={handleChange}
                />

                <Input
                  type="number"
                  name="weight_kg"
                  label="Weight (kg)"
                  value={formData.weight_kg}
                  onChange={handleChange}
                />
              </div>
            </section>

            <div className="flex flex-wrap gap-4">
              <Button type="submit" loading={saving} disabled={saving}>
                Save Changes
              </Button>

              <Link to="/player-dashboard/profile">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditPlayerProfile;
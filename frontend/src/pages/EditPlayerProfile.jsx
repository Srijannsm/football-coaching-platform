import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import { Card, CardContent } from "../components/ui/Card";
import ImageUploadField from "../components/ui/ImageUploadField";
import { useToast } from "../hooks/useToast";
import { useEditPlayerProfile } from "../hooks/useEditPlayerProfile";

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

  const {
    formData,
    isLoading,
    isSaving,
    error,
    loadFailed,
    imageError,
    profileImagePreview,
    fetchProfile,
    handleChange,
    handleImageSelect,
    handleRemoveImage,
    handleSubmit,
  } = useEditPlayerProfile(showToast);

  if (isLoading) {
    return <EditProfileSkeleton />;
  }

  if (loadFailed) {
    return (
      <EmptyState
        title="Unable to load profile"
        description={error}
        action={
          <div className="flex flex-wrap gap-3">
            <Button onClick={fetchProfile}>Try Again</Button>
            <Link to="/player-dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-brand-primary/10 bg-gradient-to-r from-brand-primary/5 via-transparent to-transparent" />

      {error ? <Alert variant="error">{error}</Alert> : null}

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
              <Button type="submit" loading={isSaving} disabled={isSaving}>
                Save Changes
              </Button>

              <Link to="/player-dashboard/profile">
                <Button variant="outline" disabled={isSaving}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditPlayerProfile;
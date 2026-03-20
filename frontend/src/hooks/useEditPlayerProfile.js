import { useCallback, useEffect, useState } from "react";
import {
  getPlayerProfile,
  updatePlayerProfile,
} from "../services/playerProfileService";
import { getErrorMessage } from "../utils/getErrorMessage";
import {
  defaultPlayerProfileForm,
  mapProfileToForm,
  getProfileUpdateErrorMessage,
} from "../utils/playerProfileFormHelpers";

export function useEditPlayerProfile(showToast) {
  const [formData, setFormData] = useState(defaultPlayerProfileForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setError("");
      setLoadFailed(false);
      setIsLoading(true);

      const profile = await getPlayerProfile();

      setFormData(mapProfileToForm(profile));
      setProfileImagePreview(profile.image || "");
      setProfileImageFile(null);
      setRemoveImage(false);
      setImageError("");
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(getErrorMessage(err, "Failed to load profile."));
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      try {
        setIsSaving(true);
        setError("");

        const updatedProfile = await updatePlayerProfile({
          formData,
          profileImageFile,
          removeImage,
        });

        setFormData(mapProfileToForm(updatedProfile));
        setProfileImagePreview(updatedProfile.image || "");
        setProfileImageFile(null);
        setRemoveImage(false);
        setImageError("");

        showToast?.("Profile updated successfully.", "success");
      } catch (err) {
        console.error("Failed to update profile:", err);
        setError(getProfileUpdateErrorMessage(err));
      } finally {
        setIsSaving(false);
      }
    },
    [formData, profileImageFile, removeImage, showToast]
  );

  return {
    formData,
    isLoading,
    isSaving,
    loadFailed,
    error,
    imageError,
    profileImagePreview,
    fetchProfile,
    handleChange,
    handleImageSelect,
    handleRemoveImage,
    handleSubmit,
  };
}
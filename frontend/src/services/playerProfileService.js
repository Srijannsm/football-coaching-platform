import api from "../api/axios";

export async function getPlayerProfile() {
  const response = await api.get("/player/profile/");
  return response.data;
}

export async function updatePlayerProfile({
  formData,
  profileImageFile,
  removeImage,
}) {
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

  const response = await api.patch("/player/profile/", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
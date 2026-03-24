import api from "../../../api/axios";

export async function getAdminCoachDirectory(queryState = {}) {
  const params = {
    page: queryState.page,
    page_size: queryState.page_size,
    search: queryState.search,
  };

  if (queryState.status === "active") {
    params.is_active = true;
  } else if (queryState.status === "inactive") {
    params.is_active = false;
  }

  const response = await api.get("/admin/coaches/directory/", { params });
  return response.data;
}

export async function updateAdminCoach(coachId, payload) {
  const response = await api.patch(`/admin/coaches/directory/${coachId}/`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export function buildCoachFormData(values) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) return;

    // Only send remove_image when user explicitly wants removal
    if (key === "remove_image") {
      if (value === true) {
        formData.append("remove_image", "true");
      }
      return;
    }

    // Never send empty image value
    if (key === "image") {
      if (value instanceof File) {
        formData.append("image", value);
      }
      return;
    }

    // Handle nullable numeric/text fields safely
    if (value === null) {
      formData.append(key, "");
      return;
    }

    formData.append(key, value);
  });

  return formData;
}

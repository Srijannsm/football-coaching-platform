import api from "../../../api/axios";

export async function getAdminGalleryCategories() {
  return (await api.get("/admin/gallery/categories/")).data;
}

export async function createAdminGalleryCategory(data) {
  return (await api.post("/admin/gallery/categories/", data)).data;
}

export async function updateAdminGalleryCategory(id, data) {
  return (await api.patch(`/admin/gallery/categories/${id}/`, data)).data;
}

export async function deleteAdminGalleryCategory(id) {
  await api.delete(`/admin/gallery/categories/${id}/`);
}

export async function getAdminGalleryItems(params = {}) {
  return (await api.get("/admin/gallery/items/", { params })).data;
}

export async function createAdminGalleryItem(formData) {
  return (
    await api.post("/admin/gallery/items/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
}

export async function updateAdminGalleryItem(id, formData) {
  return (
    await api.patch(`/admin/gallery/items/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
}

export async function deleteAdminGalleryItem(id) {
  await api.delete(`/admin/gallery/items/${id}/`);
}

export async function bulkDeleteAdminGalleryItems(ids) {
  await Promise.all(ids.map((id) => api.delete(`/admin/gallery/items/${id}/`)));
}

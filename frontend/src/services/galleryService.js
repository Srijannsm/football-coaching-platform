import api from "../api/axios";

export async function getGalleryCategories() {
  return (await api.get("/gallery/categories/")).data;
}

export async function getRandomGalleryItems(count = 8) {
  return (await api.get("/gallery/random/", { params: { count } })).data;
}

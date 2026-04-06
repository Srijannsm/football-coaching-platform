import api from "../api/axios";

async function fetchAllPages(url) {
  const all = [];
  while (url) {
    const response = await api.get(url);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data.results)) {
      all.push(...response.data.results);
    }
    url = response.data.next || null;
  }
  return all;
}

export async function getGalleryCategories() {
  return fetchAllPages("/gallery/categories/");
}

export async function getRandomGalleryItems(count = 8) {
  return (await api.get("/gallery/random/", { params: { count } })).data;
}

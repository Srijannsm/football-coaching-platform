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

export async function getCoachProfiles() {
  return fetchAllPages("/coaches/profiles/");
}

export async function getCoachProfile(id) {
  const response = await api.get(`/coaches/profiles/${id}/`);
  return response.data;
}

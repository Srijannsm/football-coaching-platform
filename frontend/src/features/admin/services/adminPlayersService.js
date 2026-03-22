import api from "../../../api/axios";
import { buildAdminQueryParams } from "../utils/buildAdminQueryParams";

export async function getAdminPlayers(queryState = {}) {
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

  const response = await api.get("/admin/players/", { params });
  return response.data;

}

export async function getAdminPlayer(playerId) {
  const response = await api.get(`/admin/players/${playerId}/`);
  return response.data;
}

export async function updateAdminPlayer(playerId, payload) {
  const response = await api.patch(`/admin/players/${playerId}/`, payload);
  return response.data;
}

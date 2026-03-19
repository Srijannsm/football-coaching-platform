import api from "../api/axios";

export async function createEnquiry(payload) {
  const response = await api.post("/enquiries/", payload);
  return response.data;
}
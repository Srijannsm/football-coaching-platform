import api from "../../../api/axios";
import { buildAdminQueryParams } from "../utils/buildAdminQueryParams";

export async function getAdminEnquiries(params = {}) {
  const response = await api.get("/admin/enquiries/", {
    params: buildAdminQueryParams(params),
  });
  return response.data;
}

export async function getAdminEnquiry(enquiryId) {
  const response = await api.get(`/admin/enquiries/${enquiryId}/`);
  return response.data;
}

export async function updateAdminEnquiry(enquiryId, payload) {
  const response = await api.patch(`/admin/enquiries/${enquiryId}/`, payload);
  return response.data;
}

export async function deleteAdminEnquiry(enquiryId) {
  const response = await api.delete(`/admin/enquiries/${enquiryId}/`);
  return response.data;
}

import api from "../../../api/axios";

export async function getAdminAuditLog(params) {
  const { data } = await api.get("/admin/audit-log/", { params });
  return data;
}

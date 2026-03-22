export function getStatusVariant(status = "") {
  const normalizedStatus = String(status).toLowerCase();

  if (["active", "published", "confirmed", "contacted", "success"].includes(normalizedStatus)) {
    return "success";
  }

  if (["pending", "new", "draft", "warning"].includes(normalizedStatus)) {
    return "warning";
  }

  if (["cancelled", "inactive", "failed", "closed", "danger"].includes(normalizedStatus)) {
    return "danger";
  }

  return "neutral";
}

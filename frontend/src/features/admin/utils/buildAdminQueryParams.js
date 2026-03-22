export function buildAdminQueryParams(params = {}) {
  const queryParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    queryParams[key] = value;
  });

  return queryParams;
}

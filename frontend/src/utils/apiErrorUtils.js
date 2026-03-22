export function normalizeApiErrors(error) {
  const responseData = error?.response?.data;

  if (!responseData || typeof responseData !== "object") {
    return {
      non_field_errors: "Something went wrong. Please try again.",
    };
  }

  const normalized = {};

  for (const key of Object.keys(responseData)) {
    const value = responseData[key];

    if (Array.isArray(value)) {
      normalized[key] = value.join(" ");
    } else if (typeof value === "string") {
      normalized[key] = value;
    } else {
      normalized[key] = "Invalid value.";
    }
  }

  return normalized;
}
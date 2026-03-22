export function normalizeApiErrors(error) {
  const responseData = error?.response?.data;

  const normalized = {
    fields: {},
    nonField: "",
  };

  if (!responseData || typeof responseData !== "object") {
    normalized.nonField = "Something went wrong. Please try again.";
    return normalized;
  }

  for (const key of Object.keys(responseData)) {
    const value = responseData[key];

    let message = "";

    if (Array.isArray(value)) {
      message = value.join(" ");
    } else if (typeof value === "string") {
      message = value;
    } else if (value && typeof value === "object") {
      message = "Invalid value.";
    } else {
      message = "Something went wrong.";
    }

    if (key === "non_field_errors" || key === "detail") {
      normalized.nonField = message;
    } else {
      normalized.fields[key] = message;
    }
  }

  return normalized;
}
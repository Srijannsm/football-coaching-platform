export const defaultPlayerProfileForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  age: "",
  preferred_foot: "",
  primary_position: "",
  secondary_position: "",
  height_cm: "",
  weight_kg: "",
};

export function mapProfileToForm(profile) {
  return {
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    email: profile?.email || "",
    phone_number: profile?.phone_number || "",
    age: profile?.age ?? "",
    preferred_foot: profile?.preferred_foot || "",
    primary_position: profile?.primary_position || "",
    secondary_position: profile?.secondary_position || "",
    height_cm: profile?.height_cm ?? "",
    weight_kg: profile?.weight_kg ?? "",
  };
}

export function getProfileUpdateErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return "Failed to update profile.";
  }

  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  const firstErrorKey = Object.keys(data)[0];
  if (!firstErrorKey) {
    return "Failed to update profile.";
  }

  const firstErrorValue = data[firstErrorKey];

  if (Array.isArray(firstErrorValue) && firstErrorValue.length > 0) {
    return firstErrorValue[0];
  }

  if (typeof firstErrorValue === "string" && firstErrorValue.trim()) {
    return firstErrorValue;
  }

  return "Failed to update profile.";
}
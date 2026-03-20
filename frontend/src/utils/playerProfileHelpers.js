export function getInitials(firstName, lastName) {
  const first = firstName?.trim()?.[0] || "";
  const last = lastName?.trim()?.[0] || "";
  return (first + last).toUpperCase() || "P";
}

export function formatPreferredFoot(value) {
  if (!value) return "Not provided";

  const map = {
    left: "Left",
    right: "Right",
    both: "Both",
  };

  return map[value] || value;
}

export function getProfileCompletion(profile) {
  if (!profile) return 0;

  const fields = [
    profile.first_name,
    profile.last_name,
    profile.email,
    profile.phone_number,
    profile.age,
    profile.preferred_foot,
    profile.primary_position,
    profile.secondary_position,
    profile.height_cm,
    profile.weight_kg,
    profile.image,
  ];

  const completed = fields.filter((field) => {
    if (field === null || field === undefined) return false;
    return String(field).trim() !== "";
  }).length;

  return Math.round((completed / fields.length) * 100);
}

export function getCompletionItems(profile) {
  return [
    {
      label: "Add profile photo",
      done: !!profile?.image,
    },
    {
      label: "Complete personal details",
      done: !!profile?.first_name && !!profile?.last_name && !!profile?.email,
    },
    {
      label: "Add football position",
      done: !!profile?.primary_position,
    },
    {
      label: "Set preferred foot",
      done: !!profile?.preferred_foot,
    },
    {
      label: "Complete physical stats",
      done: !!profile?.height_cm && !!profile?.weight_kg,
    },
  ];
}

export function getHeroSummary(profile) {
  if (!profile) return "";

  const items = [
    profile.primary_position,
    profile.secondary_position
      ? `Secondary: ${profile.secondary_position}`
      : "",
    profile.preferred_foot
      ? `${formatPreferredFoot(profile.preferred_foot)} Foot`
      : "",
  ].filter(Boolean);

  if (!items.length) {
    return "Build a complete football identity by adding your playing position, preferred foot, and physical details.";
  }

  return items.join(" • ");
}
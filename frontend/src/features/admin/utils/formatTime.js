export function formatTime(timeString) {
  if (!timeString) return "Time not set";

  const [hours, minutes] = timeString.split(":");
  if (!hours || !minutes) return timeString;

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
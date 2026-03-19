import { formatTime } from "./formatTime";

export function formatSessionTimeRange(startTime, endTime) {
  if (!startTime && !endTime) return "Not set";
  if (startTime && !endTime) return formatTime(startTime);
  if (!startTime && endTime) return formatTime(endTime);

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}
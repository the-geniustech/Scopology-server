export const parseTimeString = (
  timeStr: string
): { hours: number; minutes: number } => {
  if (!timeStr || typeof timeStr !== "string") {
    throw new Error("Time must be a non-empty string");
  }

  const trimmed = timeStr.trim().toUpperCase();

  const timeRegex = /^(\d{1,2}):(\d{2})(\s?[AP]M)?$/;

  const match = trimmed.match(timeRegex);

  if (!match) {
    throw new Error(`Invalid time format: "${timeStr}"`);
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.trim();

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    minutes > 59 ||
    hours > 12 ||
    hours < 1
  ) {
    throw new Error(`Invalid time values: "${timeStr}"`);
  }

  // Convert to 24-hour format if AM/PM is present
  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours !== 12) hours += 12;

  return { hours, minutes };
};

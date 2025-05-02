export const getInitials = (fullName: string): string => {
  if (!fullName) return "";

  return fullName
    .trim()
    .split(/\s+/) // split by any whitespace
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

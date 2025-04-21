export const buildSearchQuery = (
  keyword: string,
  fields: string[]
): Record<string, any> => {
  if (!keyword || !fields.length) return {};

  const regex = new RegExp(keyword, "i");
  return {
    $or: fields.map((field) => ({
      [field]: regex,
    })),
  };
};

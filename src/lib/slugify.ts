const normalizeSlug = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
};

export const createBaseSlug = (value: string, fallback: string) => {
  return normalizeSlug(value) || fallback;
};

export const makeUniqueSlug = async (
  baseValue: string,
  exists: (slug: string) => Promise<boolean>,
) => {
  const baseSlug = createBaseSlug(baseValue, "workspace");

  if (!(await exists(baseSlug))) {
    return baseSlug;
  }

  let counter = 2;
  const maxAttempts = 1000;

  while (counter <= maxAttempts) {
    const candidate = `${baseSlug}-${counter}`;
    if (!(await exists(candidate))) {
      return candidate;
    }
    counter += 1;
  }

  throw new Error("Unable to generate a unique slug.");
};

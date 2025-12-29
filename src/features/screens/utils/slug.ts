// src/features/screens/utils/slug.ts
export function makeSlug(input: string) {
  const s = String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return s;
}

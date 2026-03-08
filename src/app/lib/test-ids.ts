export function toTestId(...parts: Array<string | number | null | undefined>) {
  return parts
    .filter((part): part is string | number => part !== null && part !== undefined)
    .map((part) =>
      String(part)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join("-");
}

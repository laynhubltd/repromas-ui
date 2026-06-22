export function formatMetadataLabel(path: string): string {
  const segment = path.includes(".") ? (path.split(".").pop() ?? path) : path;

  return segment
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

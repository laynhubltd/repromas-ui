export function truncateFileName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 3)}...`;
}

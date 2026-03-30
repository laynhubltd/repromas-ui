export function hasItems<T>(array: T[] | undefined | null): boolean {
  return Array.isArray(array) && array.length > 0;
}

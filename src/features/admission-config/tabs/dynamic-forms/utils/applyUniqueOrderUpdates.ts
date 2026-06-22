/**
 * Reassigns unique order values on entities that share a per-parent unique
 * constraint (e.g. form sections stepOrder). Parallel updates to final positions
 * cause transient duplicates; use a temporary offset pass first.
 */
export async function applyUniqueOrderUpdates<T>(
  items: T[],
  applyOrder: (item: T, order: number) => Promise<void>,
  options?: { tempOffset?: number },
): Promise<void> {
  const tempOffset = options?.tempOffset ?? 10_000;

  for (let index = 0; index < items.length; index++) {
    await applyOrder(items[index], tempOffset + index);
  }

  for (let index = 0; index < items.length; index++) {
    await applyOrder(items[index], index + 1);
  }
}

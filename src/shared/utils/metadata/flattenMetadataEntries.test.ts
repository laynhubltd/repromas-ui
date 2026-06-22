import { describe, expect, it } from "vitest";
import { flattenMetadataEntries } from "./flattenMetadataEntries";

describe("flattenMetadataEntries", () => {
  it("flattens nested objects to dot paths", () => {
    const { entries } = flattenMetadataEntries(
      { parent: { email: "a@b.com", phone: "080" }, active: true },
      { maxDepth: 3, maxEntries: 50 },
    );

    expect(entries.map((entry) => entry.path).sort()).toEqual([
      "active",
      "parent.email",
      "parent.phone",
    ]);
  });

  it("summarizes nested values beyond maxDepth", () => {
    const { entries } = flattenMetadataEntries(
      { level1: { level2: { level3: { deep: true } } } },
      { maxDepth: 1, maxEntries: 50 },
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]?.kind).toBe("summary");
    expect(entries[0]?.path).toBe("level1");
  });

  it("truncates when maxEntries exceeded", () => {
    const value = Object.fromEntries(
      Array.from({ length: 5 }, (_, index) => [`key${index}`, index]),
    );
    const { entries, truncatedCount } = flattenMetadataEntries(value, {
      maxDepth: 3,
      maxEntries: 3,
    });

    expect(entries).toHaveLength(3);
    expect(truncatedCount).toBe(2);
  });
});

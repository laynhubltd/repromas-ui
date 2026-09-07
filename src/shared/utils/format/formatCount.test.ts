import { describe, expect, it } from "vitest";
import { formatCount } from "./formatCount";

describe("formatCount", () => {
  it("formats positive integers with commas", () => {
    expect(formatCount(1250)).toBe("1,250");
    expect(formatCount(1000000)).toBe("1,000,000");
  });

  it("handles zero correctly", () => {
    expect(formatCount(0)).toBe("0");
  });

  it("safely handles null and undefined", () => {
    expect(formatCount(null)).toBe("0");
    expect(formatCount(undefined)).toBe("0");
  });

  it("safely handles NaN", () => {
    expect(formatCount(NaN)).toBe("0");
  });
});

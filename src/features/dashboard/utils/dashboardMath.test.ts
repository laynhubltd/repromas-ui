import { describe, expect, it } from "vitest";
import { safePercent, safeRatio } from "./dashboardMath";

describe("dashboardMath", () => {
  describe("safePercent", () => {
    it("computes accurate percentages with default 1 decimal place", () => {
      expect(safePercent(3820, 4250)).toBe(89.9);
      expect(safePercent(50, 100)).toBe(50);
      expect(safePercent(1, 3, 2)).toBe(33.33);
    });

    it("safely handles 0 denominator (prevents NaN / Infinity)", () => {
      expect(safePercent(0, 0)).toBe(0);
      expect(safePercent(100, 0)).toBe(0);
    });

    it("safely handles null and undefined inputs", () => {
      expect(safePercent(null, 100)).toBe(0);
      expect(safePercent(50, null)).toBe(0);
      expect(safePercent(undefined, undefined)).toBe(0);
    });

    it("safely handles negative numbers", () => {
      expect(safePercent(-10, 100)).toBe(0);
      expect(safePercent(10, -100)).toBe(0);
    });
  });

  describe("safeRatio", () => {
    it("computes ratio between 0 and 1", () => {
      expect(safeRatio(50, 100)).toBe(0.5);
      expect(safeRatio(100, 100)).toBe(1);
    });

    it("clamps ratio to max 1", () => {
      expect(safeRatio(150, 100)).toBe(1);
    });

    it("returns 0 for zero or invalid inputs", () => {
      expect(safeRatio(0, 0)).toBe(0);
      expect(safeRatio(null, 50)).toBe(0);
    });
  });
});

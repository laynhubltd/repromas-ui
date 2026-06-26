import { describe, expect, it } from "vitest";
import { canViewApplicationDocuments } from "./canViewApplicationDocuments";

describe("canViewApplicationDocuments", () => {
  it("returns false for draft", () => {
    expect(canViewApplicationDocuments("DRAFT")).toBe(false);
  });

  it("returns false when status is undefined", () => {
    expect(canViewApplicationDocuments(undefined)).toBe(false);
  });

  it("returns true for submitted and documents verified", () => {
    expect(canViewApplicationDocuments("SUBMITTED")).toBe(true);
    expect(canViewApplicationDocuments("DOCUMENTS_VERIFIED")).toBe(true);
  });
});

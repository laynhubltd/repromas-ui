import { describe, expect, it } from "vitest";
import {
  isStateGeographyFieldKey,
  resolveGeographyStateId,
} from "./geographyFieldKeys";

describe("resolveGeographyStateId", () => {
  it("reads stateId from section values", () => {
    expect(resolveGeographyStateId({ stateId: 15 })).toBe(15);
  });

  it("falls back to state_of_origin", () => {
    expect(resolveGeographyStateId({ state_of_origin: 12 })).toBe(12);
  });

  it("returns undefined when no state is selected", () => {
    expect(resolveGeographyStateId({})).toBeUndefined();
    expect(resolveGeographyStateId({ lgaId: 3 })).toBeUndefined();
  });
});

describe("isStateGeographyFieldKey", () => {
  it("recognizes state field keys", () => {
    expect(isStateGeographyFieldKey("stateId")).toBe(true);
    expect(isStateGeographyFieldKey("state_of_origin")).toBe(true);
    expect(isStateGeographyFieldKey("lgaId")).toBe(false);
  });
});

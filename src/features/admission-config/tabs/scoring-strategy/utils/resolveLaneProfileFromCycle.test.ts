import { describe, expect, it } from "vitest";
import { resolveLaneProfileFromLane } from "./resolveLaneProfileFromCycle";

describe("resolveLaneProfileFromLane", () => {
  it("maps UTME + JAMB to UTME_JAMB", () => {
    expect(
      resolveLaneProfileFromLane({
        entryMode: "UTME",
        identityMode: "JAMB",
      }),
    ).toBe("UTME_JAMB");
  });

  it("maps UTME + OPEN to UTME_OPEN", () => {
    expect(
      resolveLaneProfileFromLane({
        entryMode: "UTME",
        identityMode: "OPEN",
      }),
    ).toBe("UTME_OPEN");
  });

  it("maps DIRECT_ENTRY (JAMB or OPEN) to DIRECT_ENTRY", () => {
    expect(
      resolveLaneProfileFromLane({ entryMode: "DIRECT_ENTRY", identityMode: "JAMB" }),
    ).toBe("DIRECT_ENTRY");
    expect(
      resolveLaneProfileFromLane({ entryMode: "DIRECT_ENTRY", identityMode: "OPEN" }),
    ).toBe("DIRECT_ENTRY");
  });

  it("returns null for TRANSFER", () => {
    expect(
      resolveLaneProfileFromLane({ entryMode: "TRANSFER", identityMode: "OPEN" }),
    ).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { resolveLaneProfileFromCycle } from "./resolveLaneProfileFromCycle";

describe("resolveLaneProfileFromCycle", () => {
  it("maps UTME + JAMB to UTME_JAMB", () => {
    expect(
      resolveLaneProfileFromCycle({
        entryMode: "UTME",
        admissionIdentityMode: "JAMB",
      }),
    ).toBe("UTME_JAMB");
  });

  it("maps UTME + OPEN to UTME_OPEN", () => {
    expect(
      resolveLaneProfileFromCycle({
        entryMode: "UTME",
        admissionIdentityMode: "OPEN",
      }),
    ).toBe("UTME_OPEN");
  });

  it("maps DIRECT_ENTRY to DIRECT_ENTRY", () => {
    expect(
      resolveLaneProfileFromCycle({ entryMode: "DIRECT_ENTRY" }),
    ).toBe("DIRECT_ENTRY");
  });

  it("returns null for TRANSFER", () => {
    expect(
      resolveLaneProfileFromCycle({ entryMode: "TRANSFER" }),
    ).toBeNull();
  });
});

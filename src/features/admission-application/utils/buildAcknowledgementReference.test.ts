import { describe, expect, it } from "vitest";
import { buildAcknowledgementReference } from "./buildAcknowledgementReference";

describe("buildAcknowledgementReference", () => {
  it("uses API acknowledgement number when provided", () => {
    expect(
      buildAcknowledgementReference({
        cycleId: 3,
        applicationId: 42,
        acknowledgementNumber: "ACK-2026-001",
      }),
    ).toBe("ACK-2026-001");
  });

  it("builds default reference from cycle and application ids", () => {
    expect(
      buildAcknowledgementReference({
        cycleId: 3,
        applicationId: 42,
      }),
    ).toBe("APP-3-42");
  });
});

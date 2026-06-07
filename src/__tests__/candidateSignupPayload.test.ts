import { describe, expect, it } from "vitest";
import {
  buildLaneSelectors,
  parseLaneParamsFromSearch,
  withLaneSelectors,
} from "@/features/auth/candidate-signup/utils/candidateSignupPayload";
import type { AdmissionSignupConfig } from "@/features/auth/candidate-signup/types/candidate-signup";

const baseConfig: AdmissionSignupConfig = {
  cycleId: 4,
  name: "2025/2026 UTME",
  status: "APPLICATION_OPEN",
  admissionIdentityMode: "JAMB",
  entryMode: "UTME",
  batchNo: 1,
  startDate: null,
  endDate: null,
};

describe("candidateSignupPayload", () => {
  it("parseLaneParamsFromSearch reads entryMode and sessionId", () => {
    const params = parseLaneParamsFromSearch(
      new URLSearchParams("entryMode=DIRECT_ENTRY&sessionId=16"),
    );
    expect(params).toEqual({ entryMode: "DIRECT_ENTRY", sessionId: 16 });
  });

  it("buildLaneSelectors uses config values by default", () => {
    expect(buildLaneSelectors(baseConfig)).toEqual({ entryMode: "UTME" });
  });

  it("buildLaneSelectors merges URL overrides", () => {
    expect(
      buildLaneSelectors(baseConfig, {
        entryMode: "DIRECT_ENTRY",
        sessionId: 16,
      }),
    ).toEqual({ entryMode: "DIRECT_ENTRY", sessionId: 16 });
  });

  it("withLaneSelectors omits undefined lane keys", () => {
    expect(withLaneSelectors({ jambRegNo: "123" }, {})).toEqual({
      jambRegNo: "123",
    });
    expect(
      withLaneSelectors(
        { jambRegNo: "123" },
        { entryMode: "UTME", sessionId: 16 },
      ),
    ).toEqual({
      jambRegNo: "123",
      entryMode: "UTME",
      sessionId: 16,
    });
  });
});

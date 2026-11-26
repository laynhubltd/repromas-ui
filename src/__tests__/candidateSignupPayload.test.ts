import { describe, expect, it } from "vitest";
import {
  buildLaneSelectors,
  parseLaneParamsFromSearch,
  readRawEntryModeFromSearch,
  withLaneSelectors,
} from "@/features/auth/candidate-signup/utils/candidateSignupPayload";
import type { AdmissionSignupConfig } from "@/features/auth/candidate-signup/types/candidate-signup";

const singleLaneConfig: AdmissionSignupConfig = {
  cycleId: 4,
  name: "2025/2026 UTME",
  status: "APPLICATION_OPEN",
  entryModes: [{ entryMode: "UTME", identityMode: "JAMB" }],
  batchNo: 1,
  startDate: null,
  endDate: null,
};

const multiLaneConfig: AdmissionSignupConfig = {
  cycleId: 5,
  name: "2025/2026 Unified",
  status: "APPLICATION_OPEN",
  entryModes: [
    { entryMode: "UTME", identityMode: "JAMB" },
    { entryMode: "DIRECT_ENTRY", identityMode: "OPEN" },
  ],
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

  it("readRawEntryModeFromSearch exposes invalid query values for blocking check", () => {
    expect(
      readRawEntryModeFromSearch(new URLSearchParams("entryMode=INVALID")),
    ).toBe("INVALID");
    expect(
      parseLaneParamsFromSearch(new URLSearchParams("entryMode=INVALID")),
    ).toEqual({});
  });

  it("buildLaneSelectors auto-selects only lane when config has single entryMode", () => {
    expect(buildLaneSelectors(singleLaneConfig)).toEqual({ entryMode: "UTME" });
  });

  it("buildLaneSelectors requires explicit selection on multi-lane cycle", () => {
    expect(buildLaneSelectors(multiLaneConfig)).toEqual({});
    expect(buildLaneSelectors(multiLaneConfig, undefined, "DIRECT_ENTRY")).toEqual({
      entryMode: "DIRECT_ENTRY",
    });
  });

  it("buildLaneSelectors merges URL overrides when selectedEntryMode not set", () => {
    expect(
      buildLaneSelectors(multiLaneConfig, {
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

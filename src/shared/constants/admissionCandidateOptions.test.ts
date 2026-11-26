import { describe, expect, it } from "vitest";
import {
  CANDIDATE_ENTRY_MODE_OPTIONS,
  getApplicationStatusLabel,
  getCandidateEntryModeLabel,
  getCandidateGenderLabel,
  getFinalDecisionLabel,
  getOfferDecisionLabel,
  isRealJambRegNo,
} from "./admissionCandidateOptions";

describe("admissionCandidateOptions labels", () => {
  it("defines UTME, DIRECT_ENTRY, and TRANSFER entry modes without legacy JAMB", () => {
    expect(CANDIDATE_ENTRY_MODE_OPTIONS.map((o) => o.value)).toEqual([
      "UTME",
      "DIRECT_ENTRY",
      "TRANSFER",
    ]);
    expect(getCandidateEntryModeLabel("DIRECT_ENTRY")).toBe("Direct Entry");
    expect(getCandidateEntryModeLabel("TRANSFER")).toBe("Transfer");
  });

  it("filters out null, blank, and synthetic APP-* placeholders in isRealJambRegNo", () => {
    expect(isRealJambRegNo(null)).toBe(false);
    expect(isRealJambRegNo(undefined)).toBe(false);
    expect(isRealJambRegNo("   ")).toBe(false);
    expect(isRealJambRegNo("APP-futb-1234ab")).toBe(false);
    expect(isRealJambRegNo("app-1-abc")).toBe(false);
    expect(isRealJambRegNo("202655999999AA")).toBe(true);
  });

  it("maps application status codes", () => {
    expect(getApplicationStatusLabel("DOCUMENTS_VERIFIED")).toBe(
      "Documents verified",
    );
    expect(getApplicationStatusLabel("UNKNOWN_STATUS")).toBe("Unknown Status");
  });

  it("maps final decision codes", () => {
    expect(getFinalDecisionLabel("ADMIT_MERIT")).toBe("Admitted (merit)");
    expect(getFinalDecisionLabel("OFFER_ADMISSION")).toBe("Offer admission");
  });

  it("maps offer decision codes", () => {
    expect(getOfferDecisionLabel("REJECTED")).toBe("Rejected");
  });

  it("maps gender codes", () => {
    expect(getCandidateGenderLabel("MALE")).toBe("Male");
    expect(getCandidateGenderLabel(null)).toBe("—");
  });
});

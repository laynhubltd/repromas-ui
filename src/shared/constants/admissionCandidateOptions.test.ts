import { describe, expect, it } from "vitest";
import {
  getApplicationStatusLabel,
  getCandidateGenderLabel,
  getFinalDecisionLabel,
  getOfferDecisionLabel,
} from "./admissionCandidateOptions";

describe("admissionCandidateOptions labels", () => {
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

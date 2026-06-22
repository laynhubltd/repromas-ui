import { describe, expect, it } from "vitest";
import {
  formatApplicationStatusLabel,
  formatCapsWarningMessage,
  formatCapsWarningStage,
} from "@/features/admission-candidate/tabs/candidate/utils/capsWarningDisplay";

describe("capsWarningDisplay", () => {
  it("maps known warning stages", () => {
    expect(formatCapsWarningStage("candidate")).toBe("Existing candidate");
    expect(formatCapsWarningStage("ignored_subject")).toBe("Subject not required");
  });

  it("prefers server message when present", () => {
    expect(
      formatCapsWarningMessage({
        stage: "candidate",
        message: "Candidate already exists for cycle and jamb_reg_no.",
      }),
    ).toBe("Candidate already exists for cycle and jamb_reg_no.");
  });

  it("falls back to stage copy when message empty", () => {
    expect(
      formatCapsWarningMessage({ stage: "application", message: "" }),
    ).toBe("Application already on file — existing record shown.");
  });

  it("humanizes application status enums", () => {
    expect(formatApplicationStatusLabel("DOCUMENTS_VERIFIED")).toBe(
      "Documents verified",
    );
    expect(formatApplicationStatusLabel("UNKNOWN_STATUS")).toBe("Unknown Status");
  });
});

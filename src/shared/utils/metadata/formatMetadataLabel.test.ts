import { describe, expect, it } from "vitest";
import { formatMetadataLabel } from "./formatMetadataLabel";

describe("formatMetadataLabel", () => {
  it("humanizes snake_case keys", () => {
    expect(formatMetadataLabel("parent_email")).toBe("Parent Email");
  });

  it("humanizes camelCase keys", () => {
    expect(formatMetadataLabel("certificateExamJamb")).toBe("Certificate Exam Jamb");
  });

  it("uses the last segment of dot paths", () => {
    expect(formatMetadataLabel("parent.contact.email")).toBe("Email");
  });
});

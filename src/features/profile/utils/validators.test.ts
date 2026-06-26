import { describe, expect, it } from "vitest";
import { validateProfilePicture } from "./profilePictureValidators";

function createFile(type: string, sizeBytes: number): File {
  const buffer = new Uint8Array(sizeBytes);
  return new File([buffer], "photo.jpg", { type });
}

describe("validateProfilePicture", () => {
  it("accepts allowed image types within size limit", () => {
    expect(validateProfilePicture(createFile("image/jpeg", 1024))).toBeNull();
    expect(validateProfilePicture(createFile("image/png", 1024))).toBeNull();
  });

  it("rejects unsupported mime types", () => {
    expect(validateProfilePicture(createFile("image/svg+xml", 1024))).toBe(
      "Please choose a JPEG, PNG, GIF, or WebP image.",
    );
  });

  it("rejects empty files", () => {
    expect(validateProfilePicture(createFile("image/jpeg", 0))).toBe(
      "Please select a non-empty image file.",
    );
  });

  it("rejects files larger than 5 MB", () => {
    expect(
      validateProfilePicture(createFile("image/jpeg", 5 * 1024 * 1024 + 1)),
    ).toBe("Image must be 5 MB or smaller.");
  });
});

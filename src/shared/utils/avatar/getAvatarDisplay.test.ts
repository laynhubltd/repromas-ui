import { describe, expect, it } from "vitest";
import { getAvatarDisplay, getAvatarInitials } from "./getAvatarDisplay";

describe("getAvatarInitials", () => {
  it("uses first letters of first and last name", () => {
    expect(getAvatarInitials("Aminu", "Musa", "a@test.edu")).toBe("AM");
  });

  it("falls back to email initial when names are missing", () => {
    expect(getAvatarInitials(null, null, "student@test.edu")).toBe("S");
  });
});

describe("getAvatarDisplay", () => {
  it("returns src when profile picture url is present", () => {
    expect(
      getAvatarDisplay({
        profilePictureUrl: "https://example.com/avatar.jpg",
        firstName: "Aminu",
        lastName: "Musa",
      }),
    ).toEqual({
      src: "https://example.com/avatar.jpg",
      initials: undefined,
    });
  });

  it("returns initials when profile picture url is missing", () => {
    expect(
      getAvatarDisplay({
        profilePictureUrl: null,
        firstName: "Aminu",
        lastName: "Musa",
      }),
    ).toEqual({
      src: undefined,
      initials: "AM",
    });
  });
});

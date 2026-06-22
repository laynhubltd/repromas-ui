import { appPaths } from "@/app/routing/app-path";
import { describe, expect, it } from "vitest";
import {
  buildStudentApplyReturnTo,
  parseWizardStepFromReturnUrl,
  validateReturnUrl,
} from "./validateReturnUrl";

describe("validateReturnUrl", () => {
  it("accepts apply path with step query", () => {
    expect(validateReturnUrl("/apply?step=2")).toBe("/apply?step=2");
  });

  it("accepts application view path without query", () => {
    expect(validateReturnUrl(appPaths.StudentApplication)).toBe(
      appPaths.StudentApplication,
    );
  });

  it("accepts student home path without query", () => {
    expect(validateReturnUrl(appPaths.studentHome)).toBe(appPaths.studentHome);
  });

  it("rejects open redirects and absolute URLs", () => {
    expect(validateReturnUrl("//evil.com")).toBeNull();
    expect(validateReturnUrl("https://evil.com")).toBeNull();
    expect(validateReturnUrl("http://evil.com/path")).toBeNull();
  });

  it("rejects invalid step values", () => {
    expect(validateReturnUrl("/apply?step=abc")).toBeNull();
    expect(validateReturnUrl("/apply?step=-1")).toBeNull();
  });

  it("rejects unknown query keys on apply path", () => {
    expect(validateReturnUrl("/apply?step=1&foo=bar")).toBeNull();
  });

  it("rejects query on application view path", () => {
    expect(validateReturnUrl("/application?step=1")).toBeNull();
  });

  it("rejects query on non-application allowlisted paths", () => {
    expect(validateReturnUrl("/student?step=1")).toBeNull();
  });
});

describe("parseWizardStepFromReturnUrl", () => {
  it("parses step from validated return URL", () => {
    expect(parseWizardStepFromReturnUrl("/apply?step=4")).toBe(4);
  });

  it("returns null when step is absent", () => {
    expect(parseWizardStepFromReturnUrl("/apply")).toBeNull();
  });
});

describe("buildStudentApplyReturnTo", () => {
  it("builds step-aware apply return path", () => {
    expect(buildStudentApplyReturnTo(3)).toBe("/apply?step=3");
  });
});

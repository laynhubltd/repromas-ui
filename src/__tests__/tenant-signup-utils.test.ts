import { describe, expect, it } from "vitest";
import { buildSignupFormData } from "../features/tenant-discovery/utils/build-signup-form-data";
import { getFirstStepWithError } from "../features/tenant-discovery/utils/field-steps";
import {
  codeRules,
  customDomainRules,
  getPostalCodeRules,
  nameRules,
  slugRules,
} from "../features/tenant-discovery/utils/validators";
import type { TenantSignupFormValues } from "../features/tenant-discovery/types";

describe("Tenant Signup Utilities", () => {
  const baseFormValues: TenantSignupFormValues = {
    name: "  Federal University of Technology, Babura  ",
    code: " futb ",
    slug: " FUTB-CAMPUS ",
    institutionType: "UNIVERSITY",
    email: "  admin@futb.edu.ng  ",
    primaryColor: "  #1E40AF  ",
    logoMode: "upload",
  };

  describe("buildSignupFormData", () => {
    it("serializes required fields, uppercase code, lowercase slug, and trims strings", () => {
      const formData = buildSignupFormData(baseFormValues);

      expect(formData.get("name")).toBe("Federal University of Technology, Babura");
      expect(formData.get("code")).toBe("FUTB");
      expect(formData.get("slug")).toBe("futb-campus");
      expect(formData.get("institutionType")).toBe("UNIVERSITY");
      expect(formData.get("email")).toBe("admin@futb.edu.ng");
      expect(formData.get("primaryColor")).toBe("#1E40AF");
      expect(formData.get("logo")).toBeNull();
      expect(formData.get("logoUrl")).toBeNull();
    });

    it("attaches binary logo file when provided in upload mode", () => {
      const mockFile = new File(["dummy png content"], "crest.png", { type: "image/png" });
      const formData = buildSignupFormData(baseFormValues, mockFile);

      const attachedLogo = formData.get("logo");
      expect(attachedLogo).toBeInstanceOf(File);
      expect((attachedLogo as File).name).toBe("crest.png");
      expect(formData.get("logoUrl")).toBeNull();
    });

    it("attaches logoUrl when logoMode is url and a URL is provided", () => {
      const valuesWithUrl: TenantSignupFormValues = {
        ...baseFormValues,
        logoMode: "url",
        logoUrl: "  https://example.com/logo.png  ",
      };

      const formData = buildSignupFormData(valuesWithUrl);

      expect(formData.get("logoUrl")).toBe("https://example.com/logo.png");
      expect(formData.get("logo")).toBeNull();
    });

    it("attaches optional fields, social links, location, and metadata JSON", () => {
      const fullValues: TenantSignupFormValues = {
        ...baseFormValues,
        tagline: "  Excellence in Research  ",
        motto: "  Knowledge is Light  ",
        fullAddress: "  PMB 001, Babura, Jigawa State  ",
        stateId: 18,
        postalCode: "  732101  ",
        phone: "  08031234567  ",
        contactEmail: "  contact@futb.edu.ng  ",
        facebook: "  https://facebook.com/futb  ",
        twitter: "  https://x.com/futb  ",
        linkedin: "  https://linkedin.com/school/futb  ",
        youtube: "  https://youtube.com/futb  ",
        customDomain: "  portal.futb.edu.ng  ",
      };

      const metadata = { source: "campaign-q4", referral: "partner" };
      const formData = buildSignupFormData(fullValues, null, metadata);

      expect(formData.get("tagline")).toBe("Excellence in Research");
      expect(formData.get("motto")).toBe("Knowledge is Light");
      expect(formData.get("fullAddress")).toBe("PMB 001, Babura, Jigawa State");
      expect(formData.get("stateId")).toBe("18");
      expect(formData.get("postalCode")).toBe("732101");
      expect(formData.get("phone")).toBe("08031234567");
      expect(formData.get("contactEmail")).toBe("contact@futb.edu.ng");
      expect(formData.get("facebook")).toBe("https://facebook.com/futb");
      expect(formData.get("twitter")).toBe("https://x.com/futb");
      expect(formData.get("linkedin")).toBe("https://linkedin.com/school/futb");
      expect(formData.get("youtube")).toBe("https://youtube.com/futb");
      expect(formData.get("customDomain")).toBe("portal.futb.edu.ng");
      expect(formData.get("metadata")).toBe(JSON.stringify(metadata));
    });

    it("omits whitespace-only optional fields and empty metadata", () => {
      const valuesWithWhitespace: TenantSignupFormValues = {
        ...baseFormValues,
        tagline: "   ",
        phone: "   ",
        customDomain: "",
      };

      const formData = buildSignupFormData(valuesWithWhitespace, null, {});

      expect(formData.get("tagline")).toBeNull();
      expect(formData.get("phone")).toBeNull();
      expect(formData.get("customDomain")).toBeNull();
      expect(formData.get("metadata")).toBeNull();
    });
  });

  describe("getPostalCodeRules", () => {
    it("returns 6-digit regex rule for Nigerian addresses", () => {
      const rules = getPostalCodeRules(true);
      expect(rules).toHaveLength(1);
      const patternRule = rules[0] as { pattern: RegExp };
      expect(patternRule.pattern.test("700001")).toBe(true);
      expect(patternRule.pattern.test("12345")).toBe(false);
      expect(patternRule.pattern.test("ABCDEF")).toBe(false);
      expect(patternRule.pattern.test("7000019")).toBe(false);
    });

    it("returns 3-10 char regex rule for international addresses", () => {
      const rules = getPostalCodeRules(false);
      expect(rules).toHaveLength(1);
      const patternRule = rules[0] as { pattern: RegExp };
      expect(patternRule.pattern.test("SW1A 1AA")).toBe(true);
      expect(patternRule.pattern.test("90210")).toBe(true);
      expect(patternRule.pattern.test("12")).toBe(false);
    });
  });

  describe("getFirstStepWithError", () => {
    it("returns 0 when errors include step 0 fields", () => {
      expect(getFirstStepWithError(["name"])).toBe(0);
      expect(getFirstStepWithError(["slug", "fullAddress"])).toBe(0);
      expect(getFirstStepWithError(["institutionType", "logo"])).toBe(0);
    });

    it("returns 1 when errors only include step 1 or higher fields", () => {
      expect(getFirstStepWithError(["primaryColor"])).toBe(1);
      expect(getFirstStepWithError(["logo", "phone"])).toBe(1);
      expect(getFirstStepWithError(["motto"])).toBe(1);
    });

    it("returns 2 when errors only include step 2 fields", () => {
      expect(getFirstStepWithError(["fullAddress"])).toBe(2);
      expect(getFirstStepWithError(["phone", "postalCode"])).toBe(2);
      expect(getFirstStepWithError(["facebook"])).toBe(2);
    });

    it("returns null when no matching fields exist", () => {
      expect(getFirstStepWithError([])).toBeNull();
      expect(getFirstStepWithError(["unknownField123"])).toBeNull();
    });
  });

  describe("Form Validation Rules", () => {
    it("validates code rules (uppercase alphanumeric, 2-20 chars)", () => {
      const patternRule = codeRules.find((r) => "pattern" in r) as { pattern: RegExp };
      expect(patternRule.pattern.test("KANOPOLY")).toBe(true);
      expect(patternRule.pattern.test("FUTB1")).toBe(true);
      expect(patternRule.pattern.test("kanopoly")).toBe(false);
      expect(patternRule.pattern.test("FUTB-CAMPUS")).toBe(false);
    });

    it("validates slug rules (lowercase alphanumeric with single hyphens)", () => {
      const patternRule = slugRules.find((r) => "pattern" in r) as { pattern: RegExp };
      expect(patternRule.pattern.test("kanopoly")).toBe(true);
      expect(patternRule.pattern.test("futb-campus")).toBe(true);
      expect(patternRule.pattern.test("FUTB")).toBe(false);
      expect(patternRule.pattern.test("futb--campus")).toBe(false);
      expect(patternRule.pattern.test("-futb")).toBe(false);
    });

    it("validates institution name rules", () => {
      const patternRule = nameRules.find((r) => "pattern" in r) as { pattern: RegExp };
      expect(patternRule.pattern.test("Kano State Polytechnic, Kano.")).toBe(true);
      expect(patternRule.pattern.test("College of Arts & Science (Main Campus)")).toBe(true);
      expect(patternRule.pattern.test("Invalid <script> Name")).toBe(false);
    });

    it("validates custom domain rule prevents repromas domains and accepts valid domains", async () => {
      const validatorRule = customDomainRules.find((r) => "validator" in r) as {
        validator: (_: unknown, val?: string) => Promise<void>;
      };

      // Empty or undefined should pass (it's optional)
      await expect(validatorRule.validator({}, undefined)).resolves.toBeUndefined();
      await expect(validatorRule.validator({}, "")).resolves.toBeUndefined();

      // Repromas platforms should fail
      await expect(validatorRule.validator({}, "portal.repromas.app")).rejects.toThrow(
        "Custom domain cannot use platform domains"
      );
      await expect(validatorRule.validator({}, "admin.repromas.com")).rejects.toThrow(
        "Custom domain cannot use platform domains"
      );
      await expect(validatorRule.validator({}, "localhost")).rejects.toThrow(
        "Custom domain cannot use platform domains"
      );

      // Valid FQDN should pass
      await expect(validatorRule.validator({}, "portal.unilag.edu.ng")).resolves.toBeUndefined();
      await expect(validatorRule.validator({}, "sms.kanopoly.edu.ng")).resolves.toBeUndefined();

      // Invalid format should fail
      await expect(validatorRule.validator({}, "not a domain")).rejects.toThrow(
        "Enter a valid domain name"
      );
    });
  });
});

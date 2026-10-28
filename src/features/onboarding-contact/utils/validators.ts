import type { Rule } from "antd/es/form";

/**
 * Mirrors the API's ContactRequest rules and wording, so a message never passes here and fails on the server.
 */

/** 0803…, 234803…, +234 803-…, or any international number with a leading +. Spaces, dashes and brackets allowed. */
export function isValidContactPhone(value: string): boolean {
  const digits = value.replace(/[\s\-().]/g, "");
  return /^0[789]\d{9}$/.test(digits) || /^234[789]\d{9}$/.test(digits) || /^\+\d{8,15}$/.test(digits);
}

export const contactTopicRules: Rule[] = [{ required: true, message: "Choose what you would like to talk to us about." }];

export const contactNameRules: Rule[] = [
  { required: true, whitespace: true, message: "Enter your full name." },
  { max: 120, message: "Full name must be 120 characters or fewer." },
];

export const contactEmailRules: Rule[] = [
  { required: true, whitespace: true, message: "Enter your work email address." },
  { type: "email", message: "Enter an email address in the correct format, like name@university.edu.ng." },
  { max: 180, message: "Email must be 180 characters or fewer." },
];

export const contactPhoneRules: Rule[] = [
  {
    validator: (_, value?: string) =>
      !value?.trim() || isValidContactPhone(value)
        ? Promise.resolve()
        : Promise.reject(new Error("Enter a phone number like 0803 123 4567 or +234 803 123 4567.")),
  },
];

export const contactInstitutionRules: Rule[] = [
  { required: true, whitespace: true, message: "Enter the name of your institution." },
  { max: 160, message: "Institution name must be 160 characters or fewer." },
];

export const contactInstitutionTypeRules: Rule[] = [{ required: true, message: "Choose your type of institution." }];

export const contactRoleRules: Rule[] = [{ required: true, message: "Choose your role." }];

export const contactMessageRules: Rule[] = [{ max: 2000, message: "Message must be 2000 characters or fewer." }];
